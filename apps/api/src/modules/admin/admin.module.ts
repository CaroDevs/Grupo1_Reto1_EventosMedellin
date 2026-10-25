import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { CategoryModule } from '../Category/category.module';
import { ActivitiesModule } from '../activities/activity.module';
import { AdminSummaryController } from './admin-summary.controller';
import { AdminSummaryService } from './admin-summary.service';

@Module({
  imports: [AuthModule, UserModule, CategoryModule, ActivitiesModule],
  controllers: [AdminSummaryController],
  providers: [AdminSummaryService],
})
export class AdminModule {}
