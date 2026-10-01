import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CatalogModule } from './modules/catalog/catalog.module';

@Module({
  imports: [ConfigModule, DatabaseModule, CatalogModule],
})
export class AppModule {}
