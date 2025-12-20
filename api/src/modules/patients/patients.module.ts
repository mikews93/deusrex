import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { DatabaseModule } from '@database/database.module';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [DatabaseModule, CommonModule],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
