import { z } from 'zod';

const sizeEnum = z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']);

const selectedColorSchema = z
  .string()
  .trim()
  .min(1, 'Selected color cannot be empty')
  .max(50, 'Selected color is too long')
  .optional();

const quantitySchema = z.coerce
  .number()
  .int('Quantity must be a whole number')
  .min(1, 'Quantity must be at least 1')
  .max(99, 'Quantity cannot exceed 99');

export const addCartItemDTO = z.object({
  productId: z.string().uuid('A valid product id is required'),
  quantity: quantitySchema.default(1),
  selectedColor: selectedColorSchema,
  selectedSize: sizeEnum.optional(),
});

export const updateCartItemDTO = z
  .object({
    quantity: quantitySchema.optional(),
    selectedColor: selectedColorSchema,
    selectedSize: sizeEnum.optional(),
  })
  .refine(
    (value) =>
      value.quantity !== undefined ||
      value.selectedColor !== undefined ||
      value.selectedSize !== undefined,
    {
      message: 'At least one cart field must be provided',
    }
  );
