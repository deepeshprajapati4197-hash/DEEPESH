import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getPrismaPaginationAndSort } from '../common/pagination-sort.dto';
import {
  TransactionSearchQueryDto,
  TransactionDto,
} from './dto/transaction-request.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { Prisma, TransactionType } from '@prisma/client';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async getAllTransactions(userId: string, query: TransactionSearchQueryDto) {
    const whereCondition: Record<string, any> = {
      createdBy: userId,
      deletedAt: null,
    };

    if (query.customerId) {
      whereCondition.customerId = query.customerId;
    }

    const { prismaOptions, meta } = getPrismaPaginationAndSort(
      query,
      'createdAt',
    );

    const [totalItems, records] = await this.prisma.$transaction([
      this.prisma.transaction.count({ where: whereCondition }),
      this.prisma.transaction.findMany({
        where: whereCondition,
        ...prismaOptions,
      }),
    ]);

    if (totalItems === 0) return [];

    return {
      data: records.map((tx) => new TransactionResponseDto(tx)),
      meta: meta(totalItems),
    };
  }

  async getTransactionById(
    id: string,
    userId: string,
  ): Promise<TransactionResponseDto> {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, createdBy: userId, deletedAt: null },
    });
    if (!tx) throw new NotFoundException('Transaction entry not found.');
    return new TransactionResponseDto(tx);
  }

  async createTransaction(
    dto: TransactionDto,
    userId: string,
  ): Promise<TransactionResponseDto> {
    if (!dto.customerId || dto.amount === undefined || !dto.type) {
      throw new BadRequestException(
        'Customer ID, amount, and type are required parameters.',
      );
    }

    const targetCustomerId: string = dto.customerId;
    const targetAmountValue: number = dto.amount;

    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: targetCustomerId, createdBy: userId, deletedAt: null },
      });
      if (!customer)
        throw new NotFoundException('Target customer profile not found.');

      const numericAmount = new Prisma.Decimal(targetAmountValue);
      let balanceAdjustment = new Prisma.Decimal(0);

      if (dto.type === 'YOU_GAVE') {
        balanceAdjustment = numericAmount;
      } else if (dto.type === 'YOU_GOT') {
        balanceAdjustment = numericAmount.negated();
      }

      const updatedCustomer = await tx.customer.update({
        where: { id: targetCustomerId },
        data: {
          currentBalance: { increment: balanceAdjustment },
          lastTransactionAt: new Date(),
        },
      });

      const newTx = await tx.transaction.create({
        data: {
          amount: numericAmount,
          type: dto.type as TransactionType,
          description: dto.description || null,
          balanceSnapshot: updatedCustomer.currentBalance,
          customerId: targetCustomerId,
          createdBy: userId,
        },
      });

      return new TransactionResponseDto(newTx);
    });
  }

  async updateTransaction(
    id: string,
    dto: TransactionDto,
    userId: string,
  ): Promise<TransactionResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findFirst({
        where: { id, createdBy: userId, deletedAt: null },
      });
      if (!oldTx)
        throw new NotFoundException('Transaction history row not found.');

      let amountDiff = new Prisma.Decimal(0);

      if (dto.amount !== undefined || dto.type !== undefined) {
        const targetAmount =
          dto.amount !== undefined
            ? new Prisma.Decimal(dto.amount)
            : oldTx.amount;
        const targetType = dto.type !== undefined ? dto.type : oldTx.type;

        const oldAdjustment =
          oldTx.type === 'YOU_GAVE' ? oldTx.amount : oldTx.amount.negated();
        const newAdjustment =
          targetType === 'YOU_GAVE' ? targetAmount : targetAmount.negated();

        amountDiff = newAdjustment.minus(oldAdjustment);
      }

      if (!amountDiff.isZero()) {
        await tx.customer.update({
          where: { id: oldTx.customerId },
          data: { currentBalance: { increment: amountDiff } },
        });
      }

      const updatedTx = await tx.transaction.update({
        where: { id },
        data: {
          ...(dto.amount !== undefined && {
            amount: new Prisma.Decimal(dto.amount),
          }),
          ...(dto.type !== undefined && { type: dto.type }),
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          updatedBy: userId,
        },
      });

      return new TransactionResponseDto(updatedTx);
    });
  }

  async softDeleteTransaction(id: string, userId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findFirst({
        where: { id, createdBy: userId, deletedAt: null },
      });
      if (!oldTx) throw new NotFoundException('Transaction record not found.');

      const rollbackAdjustment =
        oldTx.type === 'YOU_GAVE' ? oldTx.amount.negated() : oldTx.amount;

      await tx.customer.update({
        where: { id: oldTx.customerId },
        data: { currentBalance: { increment: rollbackAdjustment } },
      });

      await tx.transaction.update({
        where: { id },
        data: { deletedAt: new Date(), deletedBy: userId },
      });
    });
  }
}
