import { z } from 'zod';

/**
 * Create calendar event validation schema
 * Requirements: 7.2, 7.3
 */
export const createEventSchema = z.object({
    title: z
        .string()
        .min(1, 'Title is required')
        .max(200, 'Title must be less than 200 characters'),
    description: z
        .string()
        .min(1, 'Description is required')
        .max(2000, 'Description must be less than 2000 characters'),
    date: z
        .string()
        .datetime('Invalid date format')
        .or(z.date())
        .transform((val) => {
            if (typeof val === 'string') {
                return new Date(val);
            }
            return val;
        })
        .refine(
            (date) => date instanceof Date && !isNaN(date.getTime()),
            { message: 'Invalid date value' }
        ),
});

/**
 * Update calendar event validation schema
 * Requirements: 7.2, 7.3
 * All fields are optional for updates
 */
export const updateEventSchema = z.object({
    title: z
        .string()
        .min(1, 'Title cannot be empty')
        .max(200, 'Title must be less than 200 characters')
        .optional(),
    description: z
        .string()
        .min(1, 'Description cannot be empty')
        .max(2000, 'Description must be less than 2000 characters')
        .optional(),
    date: z
        .string()
        .datetime('Invalid date format')
        .or(z.date())
        .transform((val) => {
            if (typeof val === 'string') {
                return new Date(val);
            }
            return val;
        })
        .refine(
            (date) => date instanceof Date && !isNaN(date.getTime()),
            { message: 'Invalid date value' }
        )
        .optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided for update' }
);

// Export types
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
