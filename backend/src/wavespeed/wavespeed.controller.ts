import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  ValidationPipe,
  Get,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { WaveSpeedService } from './wavespeed.service';
import { ChatMessageDto } from './dto/chat-message.dto';
import { PredictionQueryDto } from './dto/prediction-query.dto';

@ApiTags('WaveSpeed AI')
@Controller('wavespeed')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class WaveSpeedController {
  constructor(private readonly waveSpeedService: WaveSpeedService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send message to WaveSpeed AI' })
  @ApiResponse({ status: 200, description: 'AI response' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({ type: ChatMessageDto })
  async sendMessage(
    @Request() req: any,
    @Body(ValidationPipe) chatMessageDto: ChatMessageDto,
  ) {
    const userId = req.user.id;
    return this.waveSpeedService.sendMessage(userId, chatMessageDto);
  }

  @Get('models')
  @ApiOperation({ summary: 'Get available AI models' })
  @ApiResponse({ status: 200, description: 'List of available models' })
  async getModels() {
    return this.waveSpeedService.getAvailableModels();
  }

  @Get('predictions')
  @ApiOperation({ summary: 'Get recent prediction history' })
  @ApiResponse({ status: 200, description: 'Prediction list' })
  async getPredictions(
    @Request() req: any,
    @Query(ValidationPipe) query: PredictionQueryDto,
  ) {
    return this.waveSpeedService.getPredictionHistory(req.user.id, query);
  }

  @Get('streaming/models')
  @ApiOperation({ summary: 'Get streaming-capable model IDs' })
  @ApiResponse({ status: 200, description: 'List of streaming models' })
  async getStreamingModels() {
    return this.waveSpeedService.getStreamingSupportedModels();
  }
}
