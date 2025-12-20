import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FiscalDocumentsService } from './fiscal-documents.service';
import {
  fiscalDocumentInsertSchema,
  fiscalDocumentSelectSchema,
} from '../../database/schemas/zod-schemas';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { z } from 'zod';

@Controller('fiscal-documents')
@UseGuards(JwtAuthGuard)
export class FiscalDocumentsController {
  constructor(
    private readonly fiscalDocumentsService: FiscalDocumentsService,
  ) {}

  @Post()
  create(
    @Body() createFiscalDocumentDto: z.infer<typeof fiscalDocumentInsertSchema>,
    @CurrentUser() user: any,
  ) {
    return this.fiscalDocumentsService.create({
      ...createFiscalDocumentDto,
      organizationId: user.organizationId,
      createdBy: user.id,
    });
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.fiscalDocumentsService.findAll(user.organizationId);
  }

  @Get('related/:relatedType/:relatedId')
  findByRelated(
    @Param('relatedType') relatedType: string,
    @Param('relatedId') relatedId: string,
    @CurrentUser() user: any,
  ) {
    return this.fiscalDocumentsService.findByRelated(
      relatedType,
      relatedId,
      user.organizationId,
    );
  }

  @Get('jurisdiction/:jurisdictionId')
  findByJurisdiction(
    @Param('jurisdictionId') jurisdictionId: string,
    @CurrentUser() user: any,
  ) {
    return this.fiscalDocumentsService.findByJurisdiction(
      jurisdictionId,
      user.organizationId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.fiscalDocumentsService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    updateFiscalDocumentDto: Partial<
      z.infer<typeof fiscalDocumentInsertSchema>
    >,
    @CurrentUser() user: any,
  ) {
    return this.fiscalDocumentsService.update(
      id,
      {
        ...updateFiscalDocumentDto,
        updatedBy: user.id,
      },
      user.organizationId,
    );
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    return this.fiscalDocumentsService.updateStatus(
      id,
      status,
      user.organizationId,
    );
  }
}
