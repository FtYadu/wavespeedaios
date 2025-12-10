import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'The message to send',
    example: 'Hello, how are you?',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: 'AI model to use',
    example: 'gpt-3.5-turbo',
    default: 'gpt-3.5-turbo',
  })
  @IsString()
  model: string = 'gpt-3.5-turbo';

  @ApiProperty({
    description: 'Session ID (optional)',
    example: 'cld123...',
    required: false,
  })
  @IsOptional()
  @IsString()
  sessionId?: string | null;

  @ApiProperty({
    description: 'Model parameters',
    type: 'object',
    required: false,
  })
  @IsOptional()
  @IsObject()
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  };
}