import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CachedCategoryService } from './cached-category.service';
import { CATEGORY_SERVICE } from './category-service.interface';

@Module({
  imports: [AuthModule],
  controllers: [CategoryController],
  providers: [
    CategoryService,
    CachedCategoryService,
    { provide: CATEGORY_SERVICE, useClass: CachedCategoryService },
  ],
  exports: [CategoryService, CATEGORY_SERVICE],
})
export class CategoryModule {}
