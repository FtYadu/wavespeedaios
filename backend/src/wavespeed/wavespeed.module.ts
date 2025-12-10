import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { WaveSpeedService } from './wavespeed.service';
import { WaveSpeedController } from './wavespeed.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    AuthModule,
  ],
  providers: [WaveSpeedService],
  controllers: [WaveSpeedController],
  exports: [WaveSpeedService],
})
export class WaveSpeedModule {}