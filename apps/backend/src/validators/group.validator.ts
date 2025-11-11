import { z } from 'zod';

/**
 * Create group validation schema
 * Requirements: 10.1, 10.3
 */
export const createGroupSchema = z.object({
  name: z
    .string()
    .min(1, 'Group name is required')
    .max(100, 'Group name must be less than 100 characters'),
  userIds: z
    .array(z.string().uuid('Invalid user ID format'))
    .min(1, 'At least one user must be added to the group')
    .refine(
      (userIds) => {
        // Check for duplicate user IDs
        return userIds.length === new Set(userIds).size;
      },
      { message: 'Duplicate user IDs are not allowed' }
    ),
});

/**
 * Update group validation schema
 * Requirements: 10.1, 10.3
 * All fields are optional for updates
 */
export const updateGroupSchema = z.object({
  name: z
    .string()
    .min(1, 'Group name cannot be empty')
    .max(100, 'Group name must be less than 100 characters')
    .optional(),
  userIds: z
    .array(z.string().uuid('Invalid user ID format'))
    .min(1, 'At least one user must be in the group')
    .refine(
      (userIds) => {
        // Check for duplicate user IDs
        return userIds.length === new Set(userIds).size;
      },
      { message: 'Duplicate user IDs are not allowed' }
    )
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Export types
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
