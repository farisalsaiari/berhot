import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EmailModule } from './email/email.module';
import { emailConfig } from './config/email.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [emailConfig],
    }),
    EmailModule,
  ],
})
export class AppModule {}
