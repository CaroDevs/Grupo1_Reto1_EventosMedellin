import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminSummaryService, type AdminSummary } from './admin-summary.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { ADMIN_ROLE, ORGANIZER_ROLE } from '@medellin-activities/shared-types';

@Controller('admin')
export class AdminSummaryController {
  constructor(private readonly adminSummaryService: AdminSummaryService) {}

  @Get('summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE, ORGANIZER_ROLE)
  getSummary(): Promise<AdminSummary> {
    return this.adminSummaryService.getSummary();
  }
}
