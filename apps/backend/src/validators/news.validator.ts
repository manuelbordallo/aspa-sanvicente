import { z } from 'zod';

/**
 * Create news validation schema
 * Requirements: 5.2, 5.3
 */
export const createNewsSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  content: z
    .string()
    .min(1, 'Content is required'),
  summary: z
    .string()
    .min(1, 'Summary is required')
    .max(500, 'Summary must be less than 500 characters'),
});

/**
 * Update news validation schema
 * Requirements: 5.2, 5.3
 * All fields are optional for updates
 */
export const updateNewsSchema = z.object({
  title: z
    .string()
    .min(1, 'Title cannot be empty')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  content: z
    .string()
    .min(1, 'Content cannot be empty')
    .optional(),
  summary: z
    .string()
    .min(1, 'Summary cannot be empty')
    .max(500, 'Summary must be less than 500 characters')
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Export types
export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
