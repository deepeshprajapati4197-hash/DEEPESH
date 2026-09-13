import { IsOptional, IsString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationSortDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * Universal Utility Engine
 * Operates on runtime structures without any hardcoded properties or any types.
 */
export function getPrismaPaginationAndSort(
  query: PaginationSortDto,
  defaultSort: string,
) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const skip = (page - 1) * limit;
  const sortColumn = query.sortBy ?? defaultSort;

  const serializeRecords = <T extends Record<string, unknown>>(
    records: T[],
  ): Record<string, unknown>[] => {
    return records.map((record) => {
      if (!record || typeof record !== 'object') {
        return record;
      }

      const plainObject: Record<string, unknown> = { ...record };

      for (const key in plainObject) {
        if (Object.prototype.hasOwnProperty.call(plainObject, key)) {
          const value = plainObject[key];

          if (
            value &&
            typeof value === 'object' &&
            value.constructor &&
            (value.constructor.name === 'Decimal' || 'd' in value)
          ) {
            // Explicitly narrow to an interface containing a safe toString method execution path
            const stringifiable = value as { toString: () => string };
            if (typeof stringifiable.toString === 'function') {
              plainObject[key] = stringifiable.toString();
            }
          }
        }
      }
      return plainObject;
    });
  };

  return {
    prismaOptions: {
      skip,
      take: limit,
      orderBy: {
        [sortColumn]: query.sortOrder ?? 'desc',
      } as Record<string, 'asc' | 'desc'>,
    },
    formatData: serializeRecords,
    meta: (totalItems: number) => ({
      totalItems,
      currentPage: page,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit) || 1,
    }),
  };
}
