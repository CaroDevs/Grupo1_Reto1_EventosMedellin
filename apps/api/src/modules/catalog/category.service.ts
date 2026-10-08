import { NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateCategoryDto } from "../Category/dto/create-category.dto";
import { UpdateCategoryDto } from "../Category/dto/update-category.dto";

export class CategoryService
{
  constructor(private readonly prisma: PrismaService){}
  // 1. Crear una categoría 
  create(dto: CreateCategoryDto)
  {
    return this.prisma.category.create({ data: dto});
  }
   // Obtener todas las categorías

  findAll()
  {
    return this.prisma.category.findMany({ orderBy:{ createdAt: 'desc'} });
  }
   //Obtener una sola categoría por su ID
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Categoría ${id} no encontrada`);
    }
    return category;
  }
  // Actualizar una categoría
  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({ where: { id }, data: dto });
  }
  // Eliminar una categoría
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }

}