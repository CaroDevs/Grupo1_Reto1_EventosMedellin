import { Controller, Get } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('activities')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  findAll() {
    return this.catalogService.findAll();
  }
}
