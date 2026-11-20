"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitRatingSchema = exports.createStoreSchema = exports.createUserSchema = exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Name: 20-60 characters
const nameSchema = zod_1.z
    .string({ required_error: 'Name is required.' })
    .min(20, 'Name must be at least 20 characters.')
    .max(60, 'Name must be at most 60 characters.');
// Email: valid format
const emailSchema = zod_1.z
    .string({ required_error: 'Email is required.' })
    .email('Please provide a valid email address.');
// Password: 8-16 chars, 1 uppercase, 1 special char
const passwordSchema = zod_1.z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters.')
    .max(16, 'Password must be at most 16 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character.');
// Address: non-empty, max 400 chars
const addressSchema = zod_1.z
    .string({ required_error: 'Address is required.' })
    .min(1, 'Address cannot be empty.')
    .max(400, 'Address must be at most 400 characters.');
// Rating value: integer 1-5
const ratingValueSchema = zod_1.z
    .number({ required_error: 'Rating value is required.' })
    .int('Rating must be an integer.')
    .min(1, 'Rating must be at least 1.')
    .max(5, 'Rating must be at most 5.');
// --- Auth Schemas ---
exports.registerSchema = zod_1.z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    address: addressSchema,
});
exports.loginSchema = zod_1.z.object({
    email: emailSchema,
    password: zod_1.z.string({ required_error: 'Password is required.' }).min(1),
});
exports.changePasswordSchema = zod_1.z.object({
    oldPassword: zod_1.z.string({ required_error: 'Old password is required.' }).min(1),
    newPassword: passwordSchema,
});
// --- Admin Schemas ---
exports.createUserSchema = zod_1.z.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    address: addressSchema,
    role: zod_1.z.enum(['ADMIN', 'NORMAL_USER', 'STORE_OWNER'], {
        required_error: 'Role is required.',
        invalid_type_error: 'Role must be ADMIN, NORMAL_USER, or STORE_OWNER.',
    }),
});
exports.createStoreSchema = zod_1.z.object({
    name: nameSchema,
    email: emailSchema,
    address: addressSchema,
    ownerId: zod_1.z.string().uuid('Invalid owner ID.').optional().nullable(),
});
// --- User Schemas ---
exports.submitRatingSchema = zod_1.z.object({
    storeId: zod_1.z.string({ required_error: 'Store ID is required.' }).uuid('Invalid store ID.'),
    ratingValue: ratingValueSchema,
});
