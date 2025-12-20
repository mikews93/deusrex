import { BaseService } from '@common/services/base.service';

export abstract class BaseController<T, CreateDto, UpdateDto, ResponseDto> {
  constructor(
    protected readonly service: BaseService<T>,
    protected readonly entityName: string,
  ) {}

  protected async createEntity(
    createDto: CreateDto,
    user: any,
    organizationId: string,
  ) {
    return await this.service.create(createDto as any, organizationId, user.id);
  }

  protected async findAllEntities(user: any, includeDeleted: boolean = false) {
    // All users must provide their organizationId
    const organizationId = user.organizationId;
    return await this.service.findAll(organizationId, includeDeleted);
  }

  protected async findOneEntity(
    id: string,
    user: any,
    includeDeleted: boolean = false,
  ) {
    // All users must provide their organizationId
    const organizationId = user.organizationId;
    return await this.service.findOne(id, organizationId, includeDeleted);
  }

  protected async updateEntity(id: string, updateDto: UpdateDto, user: any) {
    // All users must provide their organizationId
    const organizationId = user.organizationId;
    return await this.service.update(
      id,
      updateDto as any,
      organizationId,
      user.id,
    );
  }

  protected async removeEntity(id: string, user: any) {
    // All users must provide their organizationId
    const organizationId = user.organizationId;
    return await this.service.remove(id, organizationId, user.id);
  }

  protected async restoreEntity(id: string, user: any) {
    // All users must provide their organizationId
    const organizationId = user.organizationId;
    return await this.service.restore(id, organizationId, user.id);
  }

  protected async hardDeleteEntity(id: string, user: any) {
    // All users must provide their organizationId
    const organizationId = user.organizationId;
    return await this.service.hardDelete(id, organizationId);
  }
}
