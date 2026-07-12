import { z } from "zod";

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email.").max(255);
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password is too long.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const nameField = z.string().trim().min(1, "Required.").max(60);

export const signupSchema = z.object({
  firstName: nameField,
  lastName: nameField,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["customer", "brand"]),
  brandName: z.string().trim().max(80).optional(),
  brandTagline: z.string().trim().max(140).optional(),
  brandLocation: z.string().trim().max(80).optional(),
}).refine(v => v.role !== "brand" || (v.brandName && v.brandName.length > 0), {
  message: "Brand name is required.",
  path: ["brandName"],
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(30),
  fullName: nameField,
  street: z.string().trim().min(3, "Enter a valid street address.").max(120),
  suburb: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().min(1, "Required.").max(80),
  province: z.string().trim().min(1),
  postalCode: z.string().trim().regex(/^\d{4}$/, "Enter a 4-digit postal code."),
  phone: z.string().trim().regex(/^(\+?\d[\d\s-]{7,15})$/, "Enter a valid phone number."),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(120),
  price: z.coerce.number().positive("Price must be greater than 0.").max(10_000_000),
  category: z.string().min(1),
  gender: z.enum(["Men", "Women", "Unisex", "Kids"]),
  stock: z.coerce.number().int().min(0).max(100_000),
  sizes: z.array(z.string()).min(1, "Select at least one size."),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })).min(1, "Add at least one colour."),
  discountPct: z.coerce.number().int().min(0).max(90).optional(),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  image: z.string().optional(),
});

/** Only allow https:// or data:image/... URLs — blocks javascript:, file:, etc. */
export function sanitizeImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("data:image/")) return trimmed;
  try {
    const u = new URL(trimmed);
    if (u.protocol === "https:") return trimmed;
  } catch {
    /* fall through */
  }
  return "";
}

/** Very small text sanitizer used before rendering user-supplied strings.
 *  Since we never use dangerouslySetInnerHTML, React already escapes text —
 *  this is defensive belt-and-braces for anything that might be interpolated
 *  into a URL, title, or aria label. */
export function sanitizeText(s: string, max = 500): string {
  return s.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, max);
}

export type FieldErrors = Record<string, string>;

export function toFieldErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
