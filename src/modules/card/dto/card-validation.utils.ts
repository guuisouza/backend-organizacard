/* eslint-disable @typescript-eslint/no-explicit-any */
import z from 'zod';

export function validateCardSuperRefine(data: any, ctx: z.RefinementCtx) {
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
}
