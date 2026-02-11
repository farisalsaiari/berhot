import { Module } from '@nestjs/common';

import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { TemplateService } from './template.service';

@Module({
  controllers: [EmailController],
  providers: [EmailService, TemplateService],
  exports: [EmailService],
})
export class EmailModule {}
