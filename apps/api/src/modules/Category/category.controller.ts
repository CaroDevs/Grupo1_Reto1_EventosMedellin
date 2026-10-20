import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';
import { ADMIN_ROLE, ORGANIZER_ROLE } from '@medellin-activities/shared-types';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  //POST: Crear categoría
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE, ORGANIZER_ROLE)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }
  // GET: Obtener todas las categorías
  @Get()
  findAll() {
    return this.categoryService.findAll();
  }
  // GET: Obtener una categoría por ID (ej: /categories/123-abc)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }
  // PATCH: Actualizar una categoría por ID
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE, ORGANIZER_ROLE)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(id, dto);
  }
  // DELETE: Eliminar una categoría por ID
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(ADMIN_ROLE, ORGANIZER_ROLE)
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}