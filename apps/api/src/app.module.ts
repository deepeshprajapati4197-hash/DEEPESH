import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CustomerModule } from './customer/customer.module';
import { AuthModule } from './auth/auth.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [CustomerModule, AuthModule, TransactionModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
