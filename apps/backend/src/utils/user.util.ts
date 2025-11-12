import { Role, User } from '@prisma/client';

/**
 * Type for normalized user role (lowercase)
 */
export type NormalizedRole = 'user' | 'admin';

/**
 * Type for user without password and with normalized role
 */
export interface NormalizedUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: NormalizedRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Normalize Prisma Role enum to lowercase string
 * @param role - Prisma Role enum (USER or ADMIN)
 * @returns Normalized role in lowercase (user or admin)
 */
export function normalizeRole(role: Role): NormalizedRole {
    return role.toLowerCase() as NormalizedRole;
}

/**
 * Remove password and normalize role from Prisma User
 * @param user - Prisma User object with password
 * @returns Normalized user without password and with lowercase role
 */
export function normalizeUser(user: User): NormalizedUser {
    const { password, ...userWithoutPassword } = user;
    return {
        ...userWithoutPassword,
        role: normalizeRole(user.role),
    };
}

/**
 * Normalize multiple users
 * @param users - Array of Prisma User objects
 * @returns Array of normalized users without passwords and with lowercase roles
 */
export function normalizeUsers(users: User[]): NormalizedUser[] {
    return users.map(normalizeUser);
}
