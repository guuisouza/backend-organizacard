import z from 'zod';
import { TransactionCategoryType } from '../../../shared/enums/transaction-category.enum';

export const createTransactionSchema = z.object({
  category: z.nativeEnum(TransactionCategoryType),
  description: z.string().trim().min(1).max(150),
  amount_in_cents: z.number().int().positive(),
  transaction_date: z
    .string()
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: 'Date must be in the format YYYY-MM-DD',
    })
    .transform((val) => {
      const [year, month, day] = val.split('-').map(Number);
      return new Date(year, month - 1, day);
    })
    .refine((date) => !isNaN(date.getTime()), { message: 'Invalid date' })
    .refine(
      (date) => {
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);
        return date >= twoMonthsAgo;
      },
      {
        message: 'Transaction date must be at least two months ago',
      },
    )
    .refine(
      (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date <= today;
      },
      {
        message: 'Transaction date cannot be in the future',
      },
    ),
  is_installment: z.boolean().default(false),
  total_installments: z.number().int().min(1).max(12).optional(),
});

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;
