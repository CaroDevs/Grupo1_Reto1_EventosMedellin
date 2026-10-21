import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ActivitiesModule } from './modules/activities/activity.module';
import { CategoryModule } from './modules/Category/category.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CategoryModule,
    UserModule,
    AuthModule,
    ActivitiesModule,
  ],
})
export class AppModule {}
