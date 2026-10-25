import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CategoryService } from '../Category/category.service';
import { ActivityService } from '../activities/activity.service';

export interface AdminSummary {
  totalUsers: number;
  totalCategories: number;
  totalActivities: number;
}

// Facade: el panel de admin necesita un solo número por tarjeta
// (usuarios, categorías, actividades), que hoy viven en tres services
// que no se conocen entre sí. En vez de que el frontend le pegue a tres
// endpoints y sume los conteos por su cuenta, esta clase concentra esa
// orquestación detrás de una sola llamada.
@Injectable()
export class AdminSummaryService {
  constructor(
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
    private readonly activityService: ActivityService,
  ) {}

  async getSummary(): Promise<AdminSummary> {
    const [totalUsers, totalCategories, totalActivities] = await Promise.all([
      this.userService.count(),
      this.categoryService.count(),
      this.activityService.count(),
    ]);

    return { totalUsers, totalCategories, totalActivities };
  }
}
