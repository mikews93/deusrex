import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
