import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CategoriesService } from './modules/categories/categories.service';
import { ProductsService } from './modules/products/products.service';

@Injectable()
export class InitializationService implements OnApplicationBootstrap {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
  ) {}

  async onApplicationBootstrap() {
    console.log('Cargando categorías...');
    await this.categoriesService.addCategories();

    console.log('Cargando productos...');
    await this.productsService.addProduct();
  }
}
