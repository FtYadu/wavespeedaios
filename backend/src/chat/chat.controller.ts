import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { WaveSpeedService } from '../wavespeed/wavespeed.service';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly waveSpeedService: WaveSpeedService,
  ) {}

  @Post('message')
  @ApiOperation({ summary: 'Send message and get AI response' })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendMessage(
    @Request() req: any,
    @Body(ValidationPipe) sendMessageDto: SendMessageDto,
  ) {
    const userId = req.user.id;
    let history: { role: string; content: string }[] | undefined;

    if (sendMessageDto.sessionId) {
      const existingSession = await this.chatService.getSession(
        userId,
        sendMessageDto.sessionId,
      );
      history = existingSession.messages.map((message) => ({
        role: message.sender === 'user' ? 'user' : 'assistant',
        content: message.content,
      }));
    }
    
    // Send message to AI
    const aiResponse = await this.waveSpeedService.sendMessage(userId, {
      message: sendMessageDto.message,
      model: sendMessageDto.model,
      parameters: sendMessageDto.parameters,
      history,
    });

    // Save messages to database
    const session = await this.chatService.saveMessages(
      userId,
      sendMessageDto.sessionId,
      sendMessageDto.message,
      aiResponse.message,
      sendMessageDto.model,
      sendMessageDto.parameters,
    );

    return {
      message: aiResponse.message,
      session,
    };
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all chat sessions for user' })
  @ApiResponse({ status: 200, description: 'List of chat sessions' })
  async getSessions(@Request() req: any) {
    const userId = req.user.id;
    return this.chatService.getUserSessions(userId);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get specific chat session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Chat session details' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async getSession(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.chatService.getSession(userId, id);
  }

  @Delete('sessions/:id')
  @ApiOperation({ summary: 'Delete chat session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({ status: 200, description: 'Session deleted' })
  async deleteSession(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    await this.chatService.deleteSession(userId, id);
    return { message: 'Session deleted successfully' };
  }
}
