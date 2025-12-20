import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { clients } from '@database/schemas/clients.schema';
import { BaseService } from '@common/services/base.service';
import { Client, NewClient } from '@/database/types';

@Injectable()
export class ClientsService extends BaseService<Client> {
  constructor(databaseService: DatabaseService) {
    super(databaseService, clients);
  }

  // Override create to handle client-specific logic if needed
  async create(
    clientData: Omit<
      NewClient,
      | 'id'
      | 'organizationId'
      | 'createdBy'
      | 'updatedBy'
      | 'deletedBy'
      | 'deletedAt'
    >,
    organizationId: string,
    userId?: string,
  ) {
    return super.create(clientData, organizationId, userId);
  }

  // Override update to handle client-specific logic if needed
  async update(
    id: Client['id'],
    updateData: Partial<
      Omit<
        NewClient,
        | 'id'
        | 'organizationId'
        | 'createdBy'
        | 'updatedBy'
        | 'deletedBy'
        | 'deletedAt'
      >
    >,
    organizationId?: string,
    userId?: string,
  ) {
    return super.update(id, updateData, organizationId, userId);
  }
}
