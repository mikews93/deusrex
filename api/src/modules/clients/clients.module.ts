import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { DatabaseModule } from '@database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
