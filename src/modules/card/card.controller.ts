import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';
import { CreateCardDto, createCardSchema } from './dto/create-card.dto';
import { CurrentUserId } from '../../decorators/current-userId.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CardService } from './card.service';
import { PatchCardDto, patchCardSchema } from './dto/update-card.dto';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async createCard(
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(createCardSchema)) createCardDto: CreateCardDto,
  ) {
    return this.cardService.createCard(createCardDto, userId);
  }

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async getCards(@CurrentUserId() userId: string) {
    return this.cardService.getCards(userId);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async updateCard(
    @Param('id') id: string,
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(patchCardSchema)) patchCardto: PatchCardDto,
  ) {
    return this.cardService.patchCardById(id, userId, patchCardto);
  }

  @Delete('delete/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  async deleteCard(@Param('id') id: string, @CurrentUserId() userId: string) {
    return this.cardService.deleteCardById(id, userId);
  }
}
