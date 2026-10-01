import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
