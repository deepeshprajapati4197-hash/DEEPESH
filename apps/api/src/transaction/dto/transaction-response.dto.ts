import { ApiProperty } from '@nestjs/swagger'; // 👈 Imported
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class TransactionResponseDto {
  @ApiProperty({ example: 'tx_9812301923012' }) // 👈 Added for Swagger visibility
  @Expose()
  id!: string;

  @ApiProperty({ example: '500.00' }) // 👈 Added for Swagger visibility
  @Expose()
  @Transform(({ value }: { value: unknown }) => {
    if (value && typeof value === 'object' && 'toString' in value) {
      const stringifiable = value as { toString: () => string };
      if (typeof stringifiable.toString === 'function') {
        return stringifiable.toString();
      }
    }
    return '0.00';
  })
  amount!: string;

  @ApiProperty({ enum: ['YOU_GAVE', 'YOU_GOT'], example: 'YOU_GAVE' }) // 👈 Added for Swagger visibility
  @Expose()
  type!: 'YOU_GAVE' | 'YOU_GOT';

  @ApiProperty({
    example: 'Wholesale materials invoice statement clear',
    nullable: true,
  }) // 👈 Added for Swagger visibility
  @Expose()
  description!: string | null;

  @ApiProperty({
    example: '1500.25',
    description:
      'The absolute synchronized baseline margin immediately post mutation',
  }) // 👈 Added for Swagger visibility
  @Expose()
  @Transform(({ value }: { value: unknown }) => {
    if (value && typeof value === 'object' && 'toString' in value) {
      const stringifiable = value as { toString: () => string };
      if (typeof stringifiable.toString === 'function') {
        return stringifiable.toString();
      }
    }
    return '0.00';
  })
  balanceSnapshot!: string;

  @ApiProperty({ example: 'cust_78129381923' }) // 👈 Added for Swagger visibility
  @Expose()
  customerId!: string;

  @ApiProperty({ example: '2026-03-30T10:15:30.000Z' }) // 👈 Added for Swagger visibility
  @Expose()
  @Transform(({ value }: { value: unknown }) => {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      value instanceof Date
    ) {
      return new Date(value).toISOString();
    }
    return null;
  })
  createdAt!: string;

  constructor(partial: Record<string, unknown>) {
    Object.assign(this, partial);
  }
}
