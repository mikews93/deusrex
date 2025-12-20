import { Module } from '@nestjs/common';
import { ClerkService } from './services/clerk.service';
import { LoggingService } from './services/logging.service';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ClerkService, LoggingService],
  exports: [ClerkService, LoggingService],
})
export class CommonModule {}
