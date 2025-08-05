import { CardType } from '../../../shared/enums/card-type.enum';
import { z } from 'zod';

export const createCardSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    brand: z.string().trim().min(1).max(25),
    card_type: z.nativeEnum(CardType),
    credit_limit_in_cents: z.number().int().positive().nullable().optional(),
    available_limit_in_cents: z.number().int().positive().nullable().optional(),
    invoice_closing_day: z.number().int().min(1).max(31).nullable().optional(),
    invoice_due_day: z.number().int().min(1).max(31).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.card_type === 'credit') {
      if (
        data.credit_limit_in_cents == null ||
        data.invoice_closing_day == null ||
        data.invoice_due_day == null
      ) {
        ctx.addIssue({
          path: ['credit_card_fields'],
          code: z.ZodIssueCode.custom,
          message:
            'To register your credit card, the fields: credit_limit_in_cents, invoice_closing_day and invoice_due_day must be filled in.',
        });
      }
    }

    if (data.card_type === 'debit') {
      if (
        data.credit_limit_in_cents != null ||
        data.invoice_closing_day != null ||
        data.invoice_due_day != null
      ) {
        ctx.addIssue({
          path: ['debit_card_fields'],
          code: z.ZodIssueCode.custom,
          message:
            'Credit fields should not be set for debit cards. Please remove the fields: credit_limit_in_cents, invoice_closing_day and invoice_due_day.',
        });
      }
    }
  });

export type CreateCardDto = z.infer<typeof createCardSchema>;
