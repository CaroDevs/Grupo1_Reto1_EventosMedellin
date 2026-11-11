import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CachedCategoryService } from './cached-category.service';

@Module({
  imports: [AuthModule],
  controllers: [CategoryController],
  providers: [CategoryService, CachedCategoryService],
  exports: [CategoryService, CachedCategoryService],
})
export class CategoryModule {}
