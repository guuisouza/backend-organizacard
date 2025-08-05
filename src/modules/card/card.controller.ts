import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { CreateCardDto, createCardSchema } from './dto/create-card.dto';
import { CurrentUserId } from '../../decorators/current-userId.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CardService } from './card.service';

@Controller('cards')
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  createCard(
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(createCardSchema)) createCardDto: CreateCardDto,
  ) {
    return this.cardService.createCard(createCardDto, userId);
  }
}
