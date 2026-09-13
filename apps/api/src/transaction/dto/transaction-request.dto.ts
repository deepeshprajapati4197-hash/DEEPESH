import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // 👈 Imported
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsIn,
  Min,
} from 'class-validator';
import { PaginationSortDto } from '../../common/pagination-sort.dto';

export class TransactionSearchQueryDto extends PaginationSortDto {
  @ApiPropertyOptional({
    example: 'cust_78129381923',
    description: 'Filter history by specific customer ID',
  }) // 👈 Added for Swagger visibility
  @IsOptional()
  @IsString()
  customerId?: string;
}

export class TransactionDto {
  @ApiProperty({
    example: 500.0,
    required: false,
    description: 'The absolute financial value for ledger modification',
  }) // 👈 Added for Swagger visibility
  @IsOptional()
  @IsNumber({}, { message: 'Transaction amount must be a valid number.' })
  @Min(0.01, { message: 'Amount must be greater than zero.' })
  amount?: number;

  @ApiProperty({
    enum: ['YOU_GAVE', 'YOU_GOT'],
    example: 'YOU_GAVE',
    required: false,
    description: 'Workflow ledger mapping direction',
  }) // 👈 Added for Swagger visibility
  @IsOptional()
  @IsString()
  @IsIn(['YOU_GAVE', 'YOU_GOT'], {
    message: 'Type must be either YOU_GAVE or YOU_GOT.',
  })
  type?: 'YOU_GAVE' | 'YOU_GOT';

  @ApiPropertyOptional({
    example: 'Wholesale materials invoice statement clear',
    description: 'Optional custom context note entry',
  }) // 👈 Added for Swagger visibility
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    example: 'cust_78129381923',
    required: false,
    description: 'The unique customer profile identifier key link',
  }) // 👈 Added for Swagger visibility
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Target customer ID is required.' })
  customerId?: string;
}
