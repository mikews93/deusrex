import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TaxCategoriesService } from './tax-categories.service';
import {
  taxCategoryInsertSchema,
  taxCategorySelectSchema,
} from '../../database/schemas/zod-schemas';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { z } from 'zod';

@Controller('tax-categories')
@UseGuards(JwtAuthGuard)
export class TaxCategoriesController {
  constructor(private readonly taxCategoriesService: TaxCategoriesService) {}

  @Post()
  create(
    @Body() createTaxCategoryDto: z.infer<typeof taxCategoryInsertSchema>,
    @CurrentUser() user: any,
  ) {
    return this.taxCategoriesService.create({
      ...createTaxCategoryDto,
      organizationId: user.organizationId,
      createdBy: user.id,
    });
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.taxCategoriesService.findAll(user.organizationId);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string, @CurrentUser() user: any) {
    return this.taxCategoriesService.findByCode(code, user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.taxCategoriesService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateTaxCategoryDto: Partial<z.infer<typeof taxCategoryInsertSchema>>,
    @CurrentUser() user: any,
  ) {
    return this.taxCategoriesService.update(
      id,
      {
        ...updateTaxCategoryDto,
        updatedBy: user.id,
      },
      user.organizationId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.taxCategoriesService.remove(id, user.organizationId);
  }
}
