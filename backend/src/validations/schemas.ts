import { z } from 'zod';

// Name: 20-60 characters
const nameSchema = z
  .string({ required_error: 'Name is required.' })
  .min(20, 'Name must be at least 20 characters.')
  .max(60, 'Name must be at most 60 characters.');

// Email: valid format
const emailSchema = z
  .string({ required_error: 'Email is required.' })
  .email('Please provide a valid email address.');

// Password: 8-16 chars, 1 uppercase, 1 special char
const passwordSchema = z
  .string({ required_error: 'Password is required.' })
  .min(8, 'Password must be at least 8 characters.')
  .max(16, 'Password must be at most 16 characters.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'Password must contain at least one special character.'
  );

// Address: non-empty, max 400 chars
const addressSchema = z
  .string({ required_error: 'Address is required.' })
  .min(1, 'Address cannot be empty.')
  .max(400, 'Address must be at most 400 characters.');

// Rating value: integer 1-5
const ratingValueSchema = z
  .number({ required_error: 'Rating value is required.' })
  .int('Rating must be an integer.')
  .min(1, 'Rating must be at least 1.')
  .max(5, 'Rating must be at most 5.');

// --- Auth Schemas ---
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: 'Password is required.' }).min(1),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string({ required_error: 'Old password is required.' }).min(1),
  newPassword: passwordSchema,
});

// --- Admin Schemas ---
export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema,
  role: z.enum(['ADMIN', 'NORMAL_USER', 'STORE_OWNER'], {
    required_error: 'Role is required.',
    invalid_type_error: 'Role must be ADMIN, NORMAL_USER, or STORE_OWNER.',
  }),
});

export const createStoreSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  address: addressSchema,
  ownerId: z.string().uuid('Invalid owner ID.').optional().nullable(),
});

// --- User Schemas ---
export const submitRatingSchema = z.object({
  storeId: z.string({ required_error: 'Store ID is required.' }).uuid('Invalid store ID.'),
  ratingValue: ratingValueSchema,
});
