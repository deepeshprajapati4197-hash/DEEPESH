import { ApiProperty } from '@nestjs/swagger'; // 👈 Imported
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class CustomerResponseDto {
  @ApiProperty({ example: 'cust_78129381923' }) // 👈 Added for Swagger visibility
  @Expose()
  id!: string;

  @ApiProperty({ example: 'John Doe' }) // 👈 Added for Swagger visibility
  @Expose()
  name!: string;

  @ApiProperty({ example: '+919876543210', nullable: true }) // 👈 Added for Swagger visibility
  @Expose()
  phone!: string | null;

  @ApiProperty({ example: '0.00' }) // 👈 Added for Swagger visibility
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
  currentBalance!: string;

  constructor(partial: Record<string, unknown>) {
    Object.assign(this, partial);
  }
}
