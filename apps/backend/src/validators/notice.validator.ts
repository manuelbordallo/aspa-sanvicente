import { z } from 'zod';

/**
 * Recipient type enum - can be user or group
 */
export const recipientTypeSchema = z.enum(['user', 'group']);

/**
 * Recipient validation schema
 */
export const recipientSchema = z.object({
  id: z
    .string()
    .uuid('Invalid recipient ID format'),
  type: recipientTypeSchema,
});

/**
 * Create notice validation schema
 * Requirements: 6.2
 */
export const createNoticeSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content must be less than 5000 characters'),
  recipients: z
    .array(recipientSchema)
    .min(1, 'At least one recipient is required')
    .refine(
      (recipients) => {
        // Check for duplicate recipients
        const ids = recipients.map(r => `${r.type}-${r.id}`);
        return ids.length === new Set(ids).size;
      },
      { message: 'Duplicate recipients are not allowed' }
    ),
});

/**
 * Alternative simpler schema if recipients are just IDs
 * This can be used if the API accepts a flat array of user/group IDs
 */
export const createNoticeSimpleSchema = z.object({
  content: z
    .string()
    .min(1, 'Content is required')
    .max(5000, 'Content must be less than 5000 characters'),
  recipientUserIds: z
    .array(z.string().uuid('Invalid user ID format'))
    .optional()
    .default([]),
  recipientGroupIds: z
    .array(z.string().uuid('Invalid group ID format'))
    .optional()
    .default([]),
}).refine(
  (data) => data.recipientUserIds.length > 0 || data.recipientGroupIds.length > 0,
  { message: 'At least one user or group recipient is required' }
);

// Export types
export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;
export type CreateNoticeSimpleInput = z.infer<typeof createNoticeSimpleSchema>;
export type RecipientType = z.infer<typeof recipientTypeSchema>;
export type Recipient = z.infer<typeof recipientSchema>;
