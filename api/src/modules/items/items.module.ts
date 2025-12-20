import { Module } from '@nestjs/common';
import { DatabaseModule } from '@database/database.module';
import { ItemsService } from './items.service';

@Module({
  imports: [DatabaseModule],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
