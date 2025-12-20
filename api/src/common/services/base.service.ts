import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import {
  eq,
  desc,
  and,
  isNull,
  SQL,
  like,
  or,
  gte,
  lte,
  asc,
  sql,
  getTableName,
} from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { CommonFilter } from '../schemas/filter.schema';

@Injectable()
export abstract class BaseService<T> {
  constructor(
    protected readonly databaseService: DatabaseService,
    protected readonly table: PgTable,
  ) {}

  protected get db() {
    return this.databaseService.getDatabase();
  }

  async create(
    data: Partial<T>,
    organizationId: string,
    userId?: string,
  ): Promise<T> {
    const [result] = await this.db
      .insert(this.table)
      .values({
        ...data,
        organizationId,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();
    return result as T;
  }

  /**
   * Find all records with optional filtering, pagination, relationship loading, and column selection
   *
   * @param organizationId - Organization ID to filter by
   * @param includeDeleted - Whether to include soft-deleted records
   * @param filters - Filter options including pagination, relationships, and columns
   *
   * @example
   * // Basic usage
   * const appointments = await service.findAll(orgId);
   *
   * // With pagination
   * const paginated = await service.findAll(orgId, false, { paginated: true, page: 1, limit: 10 });
   *
   * // With relationships
   * const withRelations = await service.findAll(orgId, false, {
   *   with: {
   *     patient: true,
   *     healthProfessional: true
   *   }
   * });
   *
   * // With specific columns
   * const specificColumns = await service.findAll(orgId, false, {
   *   columns: {
   *     id: true,
   *     name: true,
   *     email: true
   *   }
   * });
   *
   * // With both relationships and columns
   * const combined = await service.findAll(orgId, false, {
   *   with: { patient: true },
   *   columns: { id: true, appointmentDate: true, status: true }
   * });
   */
  async findAll(
    organizationId?: string,
    includeDeleted: boolean = false,
    filters?: CommonFilter,
  ): Promise<T[] | { data: T[]; total: number; page: number; limit: number }> {
    // Build where conditions
    const whereConditions = this.buildWhereConditions(
      organizationId,
      includeDeleted,
      filters,
    );

    const {
      with: withRelations,
      columns,
      paginated,
      ...rest
    } = filters || ({} as CommonFilter);
    // Build query options
    const queryOptions = this.buildQueryOptions(filters);

    // Get schema name for query (this is the variable name, not the table name)
    const schemaName = this.getSchemaName();

    // Build the query with optional relationships and columns
    const queryConfig = {
      where: whereConditions,
      ...queryOptions,
      ...(withRelations && { with: withRelations }),
      ...(columns && { columns: columns }),
    };

    // If paginated is true, return paginated results
    if (paginated) {
      const [results, totalCount] = await Promise.all([
        this.db.query[schemaName].findMany(queryConfig),
        this.getTotalCount(whereConditions),
      ]);

      return {
        data: results as T[],
        total: totalCount,
        page: rest.page,
        limit: rest.limit,
      };
    }

    // Return simple array if not paginated
    const results = await this.db.query[schemaName].findMany(queryConfig);

    return results as T[];
  }

  /**
   * Find a single record by ID with optional relationship loading and column selection
   *
   * @param id - Record ID
   * @param organizationId - Organization ID to filter by
   * @param includeDeleted - Whether to include soft-deleted records
   * @param withRelations - Relationships to include in the result
   * @param columns - Specific columns to select
   *
   * @example
   * // Basic usage
   * const appointment = await service.findOne(1, orgId);
   *
   * // With relationships
   * const withRelations = await service.findOne(1, orgId, false, {
   *   patient: true,
   *   healthProfessional: true
   * });
   *
   * // With specific columns
   * const specificColumns = await service.findOne(1, orgId, false, undefined, {
   *   id: true,
   *   name: true,
   *   email: true
   * });
   */
  async findOne(
    id: string,
    organizationId?: string,
    includeDeleted: boolean = false,
    withRelations?: Record<string, any>,
    columns?: Record<string, boolean>,
  ): Promise<T | undefined> {
    const conditions: SQL[] = [eq((this.table as any).id, id)];

    if (organizationId) {
      conditions.push(eq((this.table as any).organizationId, organizationId));
    }

    // Filter out deleted records unless explicitly requested
    if (!includeDeleted && (this.table as any).deletedAt) {
      conditions.push(isNull((this.table as any).deletedAt));
    }

    const whereConditions = and(...conditions);
    const schemaName = this.getSchemaName();

    // Build query config with optional relationships and columns (same pattern as findAll)
    const queryConfig: Record<string, any> = {
      where: whereConditions,
    };

    if (withRelations) {
      queryConfig.with = withRelations;
    }
    if (columns) {
      queryConfig.columns = columns;
    }

    // Use findFirst from drizzle query API
    const result = await this.db.query[schemaName].findFirst(queryConfig);
    return result as T | undefined;
  }

  async update(
    id: string,
    data: Partial<T>,
    organizationId?: string,
    userId?: string,
  ): Promise<T | undefined> {
    const conditions: SQL[] = [eq((this.table as any).id, id)];

    if (organizationId) {
      conditions.push(eq((this.table as any).organizationId, organizationId));
    }

    // Don't update deleted records
    if ((this.table as any).deletedAt) {
      conditions.push(isNull((this.table as any).deletedAt));
    }

    const [result] = await this.db
      .update(this.table)
      .set({
        ...data,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(and(...conditions))
      .returning();
    return result as T | undefined;
  }

  async remove(
    id: string,
    organizationId?: string,
    userId?: string,
  ): Promise<{ message: string }> {
    const conditions: SQL[] = [eq((this.table as any).id, id)];

    if (organizationId) {
      conditions.push(eq((this.table as any).organizationId, organizationId));
    }

    // Don't delete already deleted records
    if ((this.table as any).deletedAt) {
      conditions.push(isNull((this.table as any).deletedAt));
    }

    // Soft delete if the table has deletedAt field, otherwise hard delete
    if ((this.table as any).deletedAt) {
      await this.db
        .update(this.table)
        .set({
          deletedAt: new Date(),
          deletedBy: userId,
          updatedAt: new Date(),
          updatedBy: userId,
        })
        .where(and(...conditions));
    } else {
      await this.db.delete(this.table).where(and(...conditions));
    }

    return { message: `${this.getEntityName()} deleted successfully` };
  }

  // Method to permanently delete (for admin use)
  async hardDelete(
    id: string,
    organizationId?: string,
  ): Promise<{ message: string }> {
    const conditions: SQL[] = [eq((this.table as any).id, id)];

    if (organizationId) {
      conditions.push(eq((this.table as any).organizationId, organizationId));
    }

    await this.db.delete(this.table).where(and(...conditions));
    return { message: `${this.getEntityName()} permanently deleted` };
  }

  // Method to restore soft deleted record
  async restore(
    id: string,
    organizationId?: string,
    userId?: string,
  ): Promise<T | undefined> {
    if (!(this.table as any).deletedAt) {
      throw new Error('This entity does not support soft delete');
    }

    const conditions: SQL[] = [eq((this.table as any).id, id)];

    if (organizationId) {
      conditions.push(eq((this.table as any).organizationId, organizationId));
    }

    const [result] = await this.db
      .update(this.table)
      .set({
        deletedAt: null,
        deletedBy: null,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(and(...conditions))
      .returning();
    return result as T | undefined;
  }

  protected getTableName(): string {
    // Use the official Drizzle getTableName function
    return getTableName(this.table);
  }

  protected getSchemaName(): string {
    const tableName = this.getTableName();
    return tableName
      .split('_')
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join('');
  }

  protected buildWhereConditions(
    organizationId?: string,
    includeDeleted: boolean = false,
    filters?: CommonFilter,
  ) {
    const conditions: any[] = [];

    if (organizationId) {
      conditions.push(eq((this.table as any).organizationId, organizationId));
    }

    // Filter out deleted records unless explicitly requested
    if (!includeDeleted && (this.table as any).deletedAt) {
      conditions.push(isNull((this.table as any).deletedAt));
    }

    // Apply filters if provided
    if (filters) {
      const { search, dateFrom, dateTo, status, includeDeleted, ...rest } =
        filters;
      if (search) {
        const searchConditions: any[] = [];
        const searchTerm = `%${search}%`;

        // Try to find searchable text fields in the table
        const tableColumns = this.table[Symbol.for('drizzle:Columns')];
        if (tableColumns) {
          Object.values(tableColumns).forEach((column: any) => {
            if (
              column.dataType === 'string' ||
              column.dataType === 'varchar' ||
              column.dataType === 'text'
            ) {
              searchConditions.push(like(column, searchTerm));
            }
          });
        }

        if (searchConditions.length > 0) {
          conditions.push(or(...searchConditions));
        }
      }

      if (dateFrom && (this.table as any).createdAt) {
        conditions.push(gte((this.table as any).createdAt, new Date(dateFrom)));
      }
      if (dateTo && (this.table as any).createdAt) {
        conditions.push(lte((this.table as any).createdAt, new Date(dateTo)));
      }

      if (status && (this.table as any).status) {
        conditions.push(eq((this.table as any).status, status));
      }

      if (rest) {
        Object.entries(rest).forEach(([key, value]) => {
          if (!this.table[key]) {
            return;
          }
          conditions.push(eq((this.table as any)[key], value));
        });
      }

      if (includeDeleted) {
        const filteredConditions = conditions.filter(
          (condition) => !condition.toString().includes('deleted_at'),
        );
        if (!includeDeleted && (this.table as any).deletedAt) {
          filteredConditions.push(isNull((this.table as any).deletedAt));
        }
        return filteredConditions.length > 0
          ? and(...filteredConditions)
          : undefined;
      }
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  private buildQueryOptions(filters?: CommonFilter) {
    const options: any = {};

    // Apply sorting
    if (filters?.sortBy) {
      const sortColumn = (this.table as any)[filters.sortBy];
      if (sortColumn) {
        options.orderBy =
          filters.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);
      }
    } else {
      // Default sorting by createdAt
      const createdAtColumn = (this.table as any).createdAt;
      if (createdAtColumn) {
        options.orderBy = desc(createdAtColumn);
      }
    }

    // Apply pagination
    if (filters?.paginated) {
      options.limit = filters.limit;
      options.offset = (filters.page - 1) * filters.limit;
    }

    return options;
  }

  protected async getTotalCount(whereConditions: any): Promise<number> {
    const result = await this.db
      .select({ count: sql`count(*)` })
      .from(this.table)
      .where(whereConditions);

    return Number(result[0]?.count || 0);
  }

  protected getEntityName(): string {
    const schemaName = this.getSchemaName();
    return schemaName.charAt(0).toUpperCase() + schemaName.slice(1);
  }
}
