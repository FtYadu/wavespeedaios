import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsObject,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ChatMessageHistoryItem {
  @ApiProperty({ description: 'Role in the conversation', enum: ['user', 'assistant', 'system'] })
  @IsString()
  role: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  content: string;
}

export class ChatMessageDto {
  @ApiProperty({
    description: 'The message to send to the AI',
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
    description: 'Model parameters',
    type: 'object',
    required: false,
  })
  @IsOptional()
  @IsObject()
  parameters?: {
    @ApiProperty({ description: 'Temperature (0-2)', example: 0.7, minimum: 0, maximum: 2 })
    @IsNumber()
    @Min(0)
    @Max(2)
    temperature?: number;

    @ApiProperty({ description: 'Maximum tokens to generate', example: 1000, minimum: 1 })
    @IsNumber()
    @Min(1)
    maxTokens?: number;

    @ApiProperty({ description: 'Top P sampling (0-1)', example: 1.0, minimum: 0, maximum: 1 })
    @IsNumber()
    @Min(0)
    @Max(1)
    topP?: number;

    @ApiProperty({ description: 'Frequency penalty (-2 to 2)', example: 0.0, minimum: -2, maximum: 2 })
    @IsNumber()
    @Min(-2)
    @Max(2)
    frequencyPenalty?: number;

    @ApiProperty({ description: 'Presence penalty (-2 to 2)', example: 0.0, minimum: -2, maximum: 2 })
    @IsNumber()
    @Min(-2)
    @Max(2)
    presencePenalty?: number;
  };

  @ApiProperty({
    description: 'Conversation history',
    type: [ChatMessageHistoryItem],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageHistoryItem)
  history?: ChatMessageHistoryItem[];
}
