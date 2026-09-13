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
import { TransactionService } from './transaction.service';
import {
  TransactionSearchQueryDto,
  TransactionDto,
} from './dto/transaction-request.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto'; // 👈 Imported for explicit typing blueprint
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'; // 👈 Imported Swagger wrappers

interface NestAuthRequest {
  user: { id: string };
}

@ApiTags('Transactions') // 👈 Groups endpoints cleanly under a standalone navigation bar tab
@ApiBearerAuth('JWT-auth') // 👈 FIXES 401: Links the top panel authentication popup to this engine controller!
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all matching business ledger rows' })
  @ApiResponse({
    status: 200,
    description: 'List collected.',
    type: TransactionResponseDto,
    isArray: true,
  }) // 👈 Boss method visibility mapping fix
  async findAll(
    @Request() req: NestAuthRequest,
    @Query() query: TransactionSearchQueryDto,
  ) {
    return await this.transactionService.getAllTransactions(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Trace deep snapshot metrics for single entry' })
  @ApiResponse({
    status: 200,
    description: 'Record found.',
    type: TransactionResponseDto,
  }) // 👈 Boss method visibility mapping fix
  async findOne(@Param('id') id: string, @Request() req: NestAuthRequest) {
    return await this.transactionService.getTransactionById(id, req.user.id);
  }

  @Post()
  @ApiOperation({
    summary: 'Commit atomic mutation balance shifting row entry',
  })
  @ApiResponse({
    status: 201,
    description: 'Ledger entry successfully committed.',
    type: TransactionResponseDto,
  }) // 👈 Boss method visibility mapping fix
  async create(@Body() body: TransactionDto, @Request() req: NestAuthRequest) {
    return await this.transactionService.createTransaction(body, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Modify parameters and re-calculate downstream margins margins updates',
  })
  @ApiResponse({
    status: 200,
    description: 'Ledger history modified cleanly.',
    type: TransactionResponseDto,
  }) // 👈 Boss method visibility mapping fix
  async update(
    @Param('id') id: string,
    @Body() body: TransactionDto,
    @Request() req: NestAuthRequest,
  ) {
    return await this.transactionService.updateTransaction(
      id,
      body,
      req.user.id,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Roll back calculations and drop active entry visibility state',
  })
  @ApiResponse({
    status: 204,
    description: 'Transaction rolled back and row soft-deleted successfully.',
  })
  async remove(@Param('id') id: string, @Request() req: NestAuthRequest) {
    await this.transactionService.softDeleteTransaction(id, req.user.id);
  }
}
