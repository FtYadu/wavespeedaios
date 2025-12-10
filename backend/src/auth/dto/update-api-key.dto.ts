import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateApiKeyDto {
  @ApiProperty({
    description: 'WaveSpeed API key',
    minLength: 20,
  })
  @IsString()
  @MinLength(20)
  apiKey: string;
}
