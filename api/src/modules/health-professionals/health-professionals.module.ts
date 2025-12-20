import { Module } from '@nestjs/common';
import { HealthProfessionalsService } from './health-professionals.service';
import { DatabaseModule } from '@database/database.module';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [DatabaseModule, CommonModule],
  providers: [HealthProfessionalsService],
  exports: [HealthProfessionalsService],
})
export class HealthProfessionalsModule {}
