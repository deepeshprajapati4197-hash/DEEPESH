import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import {
  CustomerSearchQueryDto,
  CustomerDto,
} from './dto/customer-request.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

interface NestAuthRequest {
  user: { id: string };
}

@ApiTags('Customers')
@ApiBearerAuth('JWT-auth')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of customer records.',
    type: CustomerResponseDto,
    isArray: true,
  })
  async findAll(
    @Request() req: NestAuthRequest,
    @Query() query: CustomerSearchQueryDto,
  ) {
    const data = await this.customerService.getAllCustomers(req.user.id, query);
    // Explicitly handles and sanitizes raw array mapping parameters
    return Array.isArray(data) ? data : data || [];
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by id' })
  @ApiResponse({
    status: 200,
    description: 'Returns a single customer record.',
    type: CustomerResponseDto,
  })
  async findOne(@Param('id') id: string, @Request() req: NestAuthRequest) {
    return this.customerService.getCustomerById(id, req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully.',
    type: CustomerResponseDto,
  })
  async create(@Body() body: CustomerDto, @Request() req: NestAuthRequest) {
    return this.customerService.createCustomer(body, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update custom customer parameters' })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully.',
    type: CustomerResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() body: CustomerDto,
    @Request() req: NestAuthRequest,
  ) {
    return this.customerService.updateCustomer(id, body, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a customer record' })
  @ApiResponse({
    status: 204,
    description: 'Customer record successfully soft-deleted.',
  })
  async remove(@Param('id') id: string, @Request() req: NestAuthRequest) {
    await this.customerService.softDeleteCustomer(id, req.user.id);
  }
}
