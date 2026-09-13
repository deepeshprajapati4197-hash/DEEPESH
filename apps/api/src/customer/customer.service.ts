import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getPrismaPaginationAndSort } from '../common/pagination-sort.dto';
import {
  CustomerSearchQueryDto,
  CustomerDto,
} from './dto/customer-request.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async getAllCustomers(userId: string, query: CustomerSearchQueryDto) {
    const whereCondition: Record<string, unknown> = {
      createdBy: userId,
      deletedAt: null,
    };

    if (query.search) {
      whereCondition.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const { prismaOptions, meta } = getPrismaPaginationAndSort(
      query,
      'createdAt',
    );

    const [totalItems, records] = await this.prisma.$transaction([
      this.prisma.customer.count({ where: whereCondition }),
      this.prisma.customer.findMany({
        where: whereCondition,
        ...prismaOptions,
      }),
    ]);

    // Returns an object containing an empty data array wrapper to match paginated API structure
    if (totalItems === 0) {
      return {
        data: [],
        meta: meta(0),
      };
    }

    return {
      data: records.map((customer) => new CustomerResponseDto(customer)),
      meta: meta(totalItems),
    };
  }

  async getCustomerById(
    id: string,
    userId: string,
  ): Promise<CustomerResponseDto> {
    const customer = await this.prisma.customer.findFirst({
      where: { id, createdBy: userId, deletedAt: null },
    });
    if (!customer) throw new NotFoundException('Customer record not found.');
    return new CustomerResponseDto(customer);
  }

  async createCustomer(
    dto: CustomerDto,
    userId: string,
  ): Promise<CustomerResponseDto> {
    if (!dto.name) {
      throw new BadRequestException(
        'Customer name field is required for initial setup.',
      );
    }

    if (dto.phone) {
      const existing = await this.prisma.customer.findFirst({
        where: { phone: dto.phone, createdBy: userId, deletedAt: null },
      });
      if (existing)
        throw new ConflictException(
          'A customer with this phone number already exists.',
        );
    }

    const customer = await this.prisma.customer.create({
      data: { name: dto.name, phone: dto.phone || null, createdBy: userId },
    });
    return new CustomerResponseDto(customer);
  }

  async updateCustomer(
    id: string,
    dto: CustomerDto,
    userId: string,
  ): Promise<CustomerResponseDto> {
    await this.getCustomerById(id, userId);

    if (dto.phone) {
      const existing = await this.prisma.customer.findFirst({
        where: {
          phone: dto.phone,
          createdBy: userId,
          deletedAt: null,
          NOT: { id },
        },
      });
      if (existing)
        throw new ConflictException(
          'Another customer with this phone number already exists.',
        );
    }

    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        updatedBy: userId,
      },
    });
    return new CustomerResponseDto(customer);
  }

  async softDeleteCustomer(id: string, userId: string): Promise<void> {
    await this.getCustomerById(id, userId);
    await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId },
    });
  }
}
