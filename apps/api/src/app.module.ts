import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ActivitiesModule } from './modules/activities/activity.module';


@Module({
  imports: [
    ConfigModule, 
    DatabaseModule, 
    CatalogModule, 
    UserModule, 
    AuthModule,
    ActivitiesModule, 
  ],
})
export class AppModule {}
