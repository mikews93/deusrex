import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { createDatabaseConnection } from './connection';

@Module({
  imports: [ConfigModule],
  providers: [
    DatabaseService,
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: (configService: ConfigService) => {
        return createDatabaseConnection(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [DatabaseService, 'DATABASE_CONNECTION'],
})
export class DatabaseModule {}
