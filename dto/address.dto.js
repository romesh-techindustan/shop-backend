import { z } from "zod";

const requiredString = (field) =>
  z.string().trim().min(1, `${field} is required`);

const countrySchema = z
  .string()
  .trim()
  .length(2, "Country must be a 2-letter code")
  .transform((value) => value.toUpperCase());

export const addressDTO = z.object({
  name: requiredString("Name").max(100, "Name is too long"),
  phone: requiredString("Phone").max(30, "Phone is too long"),
  line1: requiredString("Address line 1").max(255, "Address line 1 is too long"),
  line2: z.string().trim().max(255, "Address line 2 is too long").optional(),
  city: requiredString("City").max(100, "City is too long"),
  state: requiredString("State").max(100, "State is too long"),
  postalCode: requiredString("Postal code").max(30, "Postal code is too long"),
  country: countrySchema.default("US"),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressDTO = addressDTO.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "At least one address field must be provided",
  }
);
