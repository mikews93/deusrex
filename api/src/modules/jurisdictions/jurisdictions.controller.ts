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
import { JurisdictionsService } from './jurisdictions.service';
import {
  jurisdictionInsertSchema,
  jurisdictionSelectSchema,
} from '../../database/schemas/zod-schemas';
import { ClerkGuard } from '../../common/guards/clerk.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { z } from 'zod';

@Controller('jurisdictions')
@UseGuards(ClerkGuard)
export class JurisdictionsController {
  constructor(private readonly jurisdictionsService: JurisdictionsService) {}

  @Post()
  create(
    @Body() createJurisdictionDto: z.infer<typeof jurisdictionInsertSchema>,
    @CurrentUser() user: any,
  ) {
    return this.jurisdictionsService.create({
      ...createJurisdictionDto,
      organizationId: user.organizationId,
      createdBy: user.id,
    });
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.jurisdictionsService.findAll(user.organizationId);
  }

  @Get('country/:country')
  findByCountry(@Param('country') country: string, @CurrentUser() user: any) {
    return this.jurisdictionsService.findByCountry(
      country,
      user.organizationId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jurisdictionsService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateJurisdictionDto: Partial<z.infer<typeof jurisdictionInsertSchema>>,
    @CurrentUser() user: any,
  ) {
    return this.jurisdictionsService.update(
      id,
      {
        ...updateJurisdictionDto,
        updatedBy: user.id,
      },
      user.organizationId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jurisdictionsService.remove(id, user.organizationId);
  }
}
