import { z } from "zod";

export const itemBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v?.trim() ? v.trim() : null)),
  quantity: z.coerce.number().int().min(0, "Quantity must be a non-negative number"),
  price: z.coerce.number().min(0, "Price must be a non-negative number"),
  imageUrl: z.string().nullable().optional(),
  imagePublicId: z.string().nullable().optional(),
});

export type ItemBodyInput = z.input<typeof itemBodySchema>;

export const itemPayloadSchema = itemBodySchema.transform((data) => ({
  name: data.name,
  description: data.description,
  quantity: data.quantity,
  price: data.price.toFixed(2),
  imageUrl: data.imageUrl ?? null,
  imagePublicId: data.imagePublicId ?? null,
}));

export type ItemPayload = z.output<typeof itemPayloadSchema>;

export const itemIdParamSchema = z.coerce
  .number()
  .int()
  .positive("Invalid item ID");
