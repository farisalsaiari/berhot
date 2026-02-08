import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // EmailModule,
    // SmsModule,
    // PushModule,
    // InAppModule,
    // TemplateModule,
    // KafkaConsumerModule,
  ],
})
export class AppModule {}
