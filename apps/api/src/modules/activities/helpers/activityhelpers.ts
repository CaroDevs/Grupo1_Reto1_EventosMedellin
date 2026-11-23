import { PrismaService } from "../../../database/prisma.service";
import { ActivityWithLocation } from "../adapter/activity.location.port";
import { ActivityDomain } from "../domain/activity.domain";
import { ActivityStatus } from "@prisma/client";

export class ActivityHelpers {
 static toActivityDomain(activity: ActivityWithLocation): ActivityDomain {
    return new ActivityDomain({
      id: activity.id,
      title: activity.title,
      status: activity.status as ActivityStatus,
      startDate: activity.startDate ?? "",
    });
  }

  static DatePassed(startDate: string | null | undefined, now: Date = new Date()): boolean {
    if (!startDate) return false;
    const startTimestamp = new Date(startDate).getTime();
    return !Number.isNaN(startTimestamp) && startTimestamp <= now.getTime();
  }

  static async applyExpiration(
    activity: ActivityWithLocation,
    prisma: PrismaService,
    now: Date = new Date(),
  ): Promise<ActivityWithLocation> {
    if (!this.DatePassed(activity.startDate, now)) {
      return activity;
    }

    const domain = this.toActivityDomain(activity);

    try {
      domain.finish();
    } catch {
      return activity;
    }

    if (domain.status !== activity.status) {
      await prisma.activity.update({
        where: { id: activity.id },
        data: { status: domain.status },
      });
    }

    return {
      ...activity,
      status: domain.status,
    };
  }
}