import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { AuthModule } from "../auth/auth.module";
import { ActivityLocationPort } from './activity.location.port';
import { ActivityLocationAdapter } from './activity.location.adapter';

@Module({
  imports: [AuthModule],
  controllers: [ActivityController],
  providers: [
    ActivityService,
    { provide: ActivityLocationPort, useClass: ActivityLocationAdapter },
],
  exports: [ActivityService],
})
export class ActivitiesModule {}