import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Card } from '../../entities/card.entity';
import { Repository } from 'typeorm';
import { CreateCardDto } from './dto/create-card.dto';
import {
  ICreateCardResponse,
  IGetCardResponse,
  IGetCreditCardResponse,
  IGetDebitCardResponse,
} from '../../shared/interfaces/card.interface';
import { CardType } from '../../shared/enums/card-type.enum';
import { PatchCardDto } from './dto/update-card.dto';

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

    if (data.card_type === CardType.CREDIT) {
      if (data.invoice_due_day! <= data.invoice_closing_day!) {
        throw new BadRequestException(
          'Due day must be greater than closing day',
        );
      }
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

  async getCards(userId: string): Promise<IGetCardResponse[] | null> {
    const cards = await this.cardsRepository.findBy({ user: { id: userId } });

    if (!cards) {
      return [];
    }

    console.log(cards);

    const formattedCards = cards.map((card) => {
      if (card.card_type === CardType.DEBIT) {
        return {
          id: card.id,
          name: card.name,
          brand: card.brand,
          card_type: CardType.DEBIT,
        } as IGetDebitCardResponse;
      }
      return {
        id: card.id,
        name: card.name,
        brand: card.brand,
        card_type: CardType.CREDIT,
        credit_limit_in_cents: card.credit_limit_in_cents,
        invoice_closing_day: card.invoice_closing_day,
        invoice_due_day: card.invoice_due_day,
      } as IGetCreditCardResponse;
    });

    return formattedCards;
  }

  async patchCardById(
    id: string,
    userId: string,
    data: PatchCardDto,
  ): Promise<void> {
    const existingCard = await this.cardsRepository.findOneBy({
      id,
      user: { id: userId },
    });

    if (!existingCard) {
      throw new NotFoundException('Card not found');
    }

    if ('card_type' in data) {
      throw new BadRequestException('You cannot change the card type');
    }

    const sanitizedData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined),
    );

    if (Object.keys(sanitizedData).length === 0) {
      throw new BadRequestException('No valid fields provided for update.');
    }

    if (existingCard.card_type === CardType.DEBIT) {
      const {
        credit_limit_in_cents,
        invoice_closing_day,
        invoice_due_day,
        ...validDebitData
      } = data;

      await this.cardsRepository.update({ id }, validDebitData);
      return;
    }

    await this.cardsRepository.update({ id }, sanitizedData);
    return;
  }

  async deleteCardById(id: string, userId: string): Promise<void> {
    const existingCard = await this.cardsRepository.findOneBy({
      id,
      user: { id: userId },
    });

    if (!existingCard) {
      throw new NotFoundException('Card not found');
    }

    await this.cardsRepository.delete({ id });
  }

  async findCardByIdOrThrow(id: string): Promise<Card> {
    const card = await this.cardsRepository.findOneBy({ id });
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    return card;
  }
}
