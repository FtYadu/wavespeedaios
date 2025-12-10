import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AuthModule } from '../auth/auth.module';
import { WaveSpeedModule } from '../wavespeed/wavespeed.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    WaveSpeedModule,
  ],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}
