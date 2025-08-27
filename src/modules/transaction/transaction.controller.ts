import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import {
  CreateTransactionDto,
  createTransactionSchema,
} from './dto/create-transaction.dto';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('/cards/:cardId')
  @UseGuards(JwtAuthGuard)
  async createTransaction(
    @Param('cardId', new ParseUUIDPipe({ version: '4' })) cardId: string,
    @Body(new ZodValidationPipe(createTransactionSchema))
    createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionService.createTransaction(
      createTransactionDto,
      cardId,
    );
  }

  @Get('/cards/:cardId')
  @UseGuards(JwtAuthGuard)
  async getCardTransactionsByCurrentInvoice(
    @Param('cardId', new ParseUUIDPipe({ version: '4' })) cardId: string,
  ) {
    return this.transactionService.getCardTransactionsByCurrentInvoice(cardId);
  }

  @Get('/cards/:cardId/:transactionId')
  @UseGuards(JwtAuthGuard)
  async getTransactionById(
    @Param('cardId', new ParseUUIDPipe({ version: '4' })) cardId: string,
    @Param('transactionId', new ParseUUIDPipe({ version: '4' }))
    transactionId: string,
  ) {
    return this.transactionService.getTransactionById(cardId, transactionId);
  }

  @Delete('/cards/:cardId/:transactionId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deleteTransactionById(
    @Param('cardId', new ParseUUIDPipe({ version: '4' })) cardId: string,
    @Param('transactionId', new ParseUUIDPipe({ version: '4' }))
    transactionId: string,
  ) {
    return this.transactionService.deleteTransactionById(cardId, transactionId);
  }
}
