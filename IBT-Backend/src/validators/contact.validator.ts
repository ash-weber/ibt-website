import { ContactType } from "../../generated/prisma/client";
import { z } from "zod";

const phoneRegex = /^\+?[0-9()\-\s]{7,25}$/;

const parseContactType = (value: unknown) => {
  if (typeof value === "string") {
    const normalized = value.toUpperCase();

    if (normalized in ContactType) {
      return normalized;
    }
  }

  return value;
};

const contactValueSchema = z
  .string("Contact value is required")
  .trim()
  .min(1, "Contact value is required")
  .max(500, "Contact value must be at most 500 characters long");

const validateValueByType = (
  data: { type: ContactType; value: string },
  ctx: z.RefinementCtx
) => {
  if (data.type === ContactType.EMAIL && !z.string().email().safeParse(data.value).success) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["value"],
      message: "Contact value must be a valid email for EMAIL type",
    });
  }

  if (data.type === ContactType.PHONE && !phoneRegex.test(data.value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["value"],
      message: "Contact value must be a valid phone number for PHONE type",
    });
  }

  if (data.type === ContactType.ADDRESS && data.value.length < 5) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["value"],
      message: "Contact value must be at least 5 characters for ADDRESS type",
    });
  }
};

export const createContactSchema = z
  .object({
    type: z.preprocess(parseContactType, z.nativeEnum(ContactType)),
    value: contactValueSchema,
    order: z
      .number("Order must be a number")
      .int("Order must be an integer")
      .min(1, "Order must be at least 1")
      .optional(),
  })
  .superRefine(validateValueByType);

export const updateContactSchema = z
  .object({
    type: z.preprocess(parseContactType, z.nativeEnum(ContactType).optional()),
    value: contactValueSchema.optional(),
    order: z
      .number("Order must be a number")
      .int("Order must be an integer")
      .min(1, "Order must be at least 1")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })
  .superRefine((data, ctx) => {
    const type = data.type;
    const value = data.value;

    if (type && value) {
      validateValueByType({ type, value }, ctx);
    }
  });

export const contactIdParamSchema = z.object({
  contactId: z.string().uuid("Invalid contactId format"),
});

export const listContactQuerySchema = z
  .object({
    type: z.preprocess(parseContactType, z.nativeEnum(ContactType).optional()),
    search: z.string().trim().min(1).max(100).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .refine((data) => (data.page === undefined) === (data.limit === undefined), {
    message: "Both page and limit are required for pagination",
  });
