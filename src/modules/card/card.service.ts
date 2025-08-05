import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from '../../entities/card.entity';
import { Repository } from 'typeorm';
import { CreateCardDto } from './dto/create-card.dto';
import { ICreateCardResponse } from 'src/shared/interfaces/card.interface';
import { CardType } from '../../shared/enums/card-type.enum';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card) private cardsRepository: Repository<Card>,
  ) {}

  async createCard(
    data: CreateCardDto,
    userId: string,
  ): Promise<ICreateCardResponse> {
    const countOfCreatedCards = await this.cardsRepository.count({
      where: { user: { id: userId } },
    });

    if (countOfCreatedCards >= 5) {
      throw new BadRequestException("You can't create more than 5 cards");
    }

    const createdCard = this.cardsRepository.create({
      ...data,
      user: { id: userId },
    });

    await this.cardsRepository.save(createdCard);

    if (createdCard.card_type === 'debit') {
      return {
        id: createdCard.id,
        name: createdCard.name,
        brand: createdCard.brand,
        card_type: CardType.DEBIT,
        created_at: createdCard.created_at,
        user_id: createdCard.user.id,
      };
    }

    return {
      id: createdCard.id,
      name: createdCard.name,
      brand: createdCard.brand,
      card_type: CardType.CREDIT,
      created_at: createdCard.created_at,
      user_id: createdCard.user.id,
      credit_limit_in_cents: createdCard.credit_limit_in_cents!,
      invoice_closing_day: createdCard.invoice_closing_day!,
      invoice_due_day: createdCard.invoice_due_day!,
    };
  }
}
