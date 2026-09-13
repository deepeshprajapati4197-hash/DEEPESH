import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // 👈 Imported
import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { PaginationSortDto } from '../../common/pagination-sort.dto';

// For GET Requests
export class CustomerSearchQueryDto extends PaginationSortDto {}

// For Both POST (Create) and PATCH (Update) Requests
export class CustomerDto {
  @ApiProperty({
    example: 'John Doe',
    required: false,
    description: 'The name of the customer',
  }) // 👈 Added for Swagger visibility
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Customer name cannot be empty.' })
  name?: string;

  @ApiPropertyOptional({
    example: '+919876543210',
    description: 'The phone number of the customer',
  }) // 👈 Added for Swagger visibility
  @IsOptional()
  @IsString()
  @Matches(/^[0-9+ ]{10,15}$/, {
    message: 'Phone number must be 10 to 15 digits.',
  })
  phone?: string | null;
}
