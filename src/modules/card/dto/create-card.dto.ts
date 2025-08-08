import { CardType } from '../../../shared/enums/card-type.enum';
import { z } from 'zod';
import { validateCardSuperRefine } from './card-validation.utils';

export const createCardSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    brand: z.string().trim().min(1).max(25),
    card_type: z.nativeEnum(CardType),
    credit_limit_in_cents: z.number().int().positive().nullable().optional(),
    invoice_closing_day: z.number().int().min(1).max(31).nullable().optional(),
    invoice_due_day: z.number().int().min(1).max(31).nullable().optional(),
  })
  .superRefine(validateCardSuperRefine);

export type CreateCardDto = z.infer<typeof createCardSchema>;
