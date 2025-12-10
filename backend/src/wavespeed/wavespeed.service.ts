import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { PredictionQueryDto } from './dto/prediction-query.dto';

@Injectable()
export class WaveSpeedService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private authService: AuthService,
  ) {
    this.apiUrl = this.configService.get('WAVESPEED_API_URL', 'https://api.wavespeed.ai/v1');
    this.apiKey = this.configService.get('WAVESPEED_API_KEY');
  }

  async sendMessage(userId: string, chatMessageDto: ChatMessageDto) {
    const apiKey = await this.resolveApiKey(userId);
    const startTime = Date.now();
    try {
      const messages =
        chatMessageDto.history?.map((message) => ({
          role: message.role,
          content: message.content,
        })) || [];

      messages.push({
        role: 'user',
        content: chatMessageDto.message,
      });

      const payload = {
        model: chatMessageDto.model,
        messages,
        temperature: chatMessageDto.parameters?.temperature || 0.7,
        max_tokens: chatMessageDto.parameters?.maxTokens || 1000,
        top_p: chatMessageDto.parameters?.topP || 1.0,
        frequency_penalty: chatMessageDto.parameters?.frequencyPenalty || 0.0,
        presence_penalty: chatMessageDto.parameters?.presencePenalty || 0.0,
      };

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/chat/completions`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      const message = response.data.choices?.[0]?.message?.content || '';
      
      if (!message) {
        throw new InternalServerErrorException('Empty response from AI service');
      }

      await this.logApiCall(userId, `${this.apiUrl}/chat/completions`, 'POST', response.status, startTime);

      return {
        message,
        model: chatMessageDto.model,
        usage: response.data.usage,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const statusCode =
        error?.response?.status ||
        (error?.request ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.INTERNAL_SERVER_ERROR);

      await this.logApiCall(userId, `${this.apiUrl}/chat/completions`, 'POST', statusCode, startTime, duration);

      if (error.response) {
        const message = error.response.data?.error?.message || 'AI service error';

        throw new HttpException(
          {
            statusCode,
            message,
            error: 'AI Service Error',
          },
          statusCode,
        );
      }

      if (error.request) {
        throw new HttpException(
          {
            statusCode,
            message: 'AI service is unavailable',
            error: 'Service Unavailable',
          },
          statusCode,
        );
      }

      throw new InternalServerErrorException('Failed to process request');
    }
  }

  getAvailableModels() {
    // Mock available models - in production, this would fetch from WaveSpeed API
    return [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        description: 'Fast and efficient model for general conversations',
        maxTokens: 4096,
        defaultParameters: {
          temperature: 0.7,
          maxTokens: 1000,
          topP: 1.0,
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
        },
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        description: 'Most capable model for complex tasks',
        maxTokens: 8192,
        defaultParameters: {
          temperature: 0.7,
          maxTokens: 2000,
          topP: 1.0,
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
        },
      },
      {
        id: 'gpt-4-turbo',
        name: 'GPT-4 Turbo',
        description: 'Latest GPT-4 model with improved capabilities',
        maxTokens: 128000,
        defaultParameters: {
          temperature: 0.7,
          maxTokens: 4000,
          topP: 1.0,
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
        },
      },
    ];
  }

  async getPredictionHistory(userId: string, query: PredictionQueryDto) {
    const apiKey = await this.resolveApiKey(userId);
    const startTime = Date.now();

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/predictions`,
          {
            page: query.page || 1,
            page_size: query.pageSize || 100,
            model: query.model || null,
            status: query.status || null,
            created_after: query.createdAfter || null,
            created_before: query.createdBefore || null,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      await this.logApiCall(userId, `${this.apiUrl}/predictions`, 'POST', response.status, startTime);
      return response.data;
    } catch (error) {
      const statusCode =
        error?.response?.status ||
        (error?.request ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.INTERNAL_SERVER_ERROR);

      await this.logApiCall(userId, `${this.apiUrl}/predictions`, 'POST', statusCode, startTime);
      throw this.createHttpException(error);
    }
  }

  getStreamingSupportedModels() {
    return [
      'minimax/speech-02-hd',
      'minimax/speech-02-turbo',
      'minimax/speech-2.5-hd-preview',
      'minimax/speech-2.5-turbo-preview',
      'minimax/speech-2.6-hd',
      'minimax/speech-2.6-turbo',
      'minimax/music-02',
      'wavespeed-ai/any-llm',
      'wavespeed-ai/any-llm/vision',
    ];
  }

  private async resolveApiKey(userId: string): Promise<string> {
    const userApiKey = await this.authService.getUserApiKey(userId);
    const apiKey = userApiKey || this.apiKey;

    if (!apiKey) {
      throw new UnauthorizedException('No API key configured');
    }

    return apiKey;
  }

  private async logApiCall(
    userId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    startTime: number,
    durationOverride?: number,
  ) {
    await this.prisma.apiCall.create({
      data: {
        userId,
        endpoint,
        method,
        statusCode,
        duration: durationOverride ?? Date.now() - startTime,
      },
    });
  }

  private createHttpException(error: any) {
    if (error.response) {
      const statusCode = error.response.status;
      const message = error.response.data?.error?.message || 'AI service error';

      return new HttpException(
        {
          statusCode,
          message,
          error: 'AI Service Error',
        },
        statusCode,
      );
    }

    if (error.request) {
      return new HttpException(
        {
          statusCode: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'AI service is unavailable',
          error: 'Service Unavailable',
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return new InternalServerErrorException('Failed to process request');
  }
}
