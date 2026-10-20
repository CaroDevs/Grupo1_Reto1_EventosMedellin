import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService
{
  constructor(private readonly prisma: PrismaService){}
  // 1. Crear una categoría
  async create(dto: CreateCategoryDto)
  {
    try {
      return await this.prisma.category.create({ data: dto});
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
      throw error;
    }
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
    try {
      return await this.prisma.category.update({ where: { id }, data: dto });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
      throw error;
    }
  }
  // Eliminar una categoría
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.delete({ where: { id } });
  }

}