import { Role, User } from '@prisma/client';
import { normalizeRole, normalizeUser, normalizeUsers } from '../../src/utils/user.util';

describe('User Utility Functions', () => {
    describe('normalizeRole', () => {
        it('should convert USER to lowercase user', () => {
            const result = normalizeRole(Role.USER);
            expect(result).toBe('user');
        });

        it('should convert ADMIN to lowercase admin', () => {
            const result = normalizeRole(Role.ADMIN);
            expect(result).toBe('admin');
        });
    });

    describe('normalizeUser', () => {
        const mockUser: User = {
            id: '123',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'hashedPassword123',
            role: Role.USER,
            isActive: true,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
        };

        it('should remove password from user object', () => {
            const result = normalizeUser(mockUser);
            expect(result).not.toHaveProperty('password');
        });

        it('should normalize role to lowercase', () => {
            const result = normalizeUser(mockUser);
            expect(result.role).toBe('user');
        });

        it('should preserve all other user properties', () => {
            const result = normalizeUser(mockUser);
            expect(result.id).toBe(mockUser.id);
            expect(result.firstName).toBe(mockUser.firstName);
            expect(result.lastName).toBe(mockUser.lastName);
            expect(result.email).toBe(mockUser.email);
            expect(result.isActive).toBe(mockUser.isActive);
            expect(result.createdAt).toEqual(mockUser.createdAt);
            expect(result.updatedAt).toEqual(mockUser.updatedAt);
        });

        it('should normalize ADMIN role to lowercase', () => {
            const adminUser: User = { ...mockUser, role: Role.ADMIN };
            const result = normalizeUser(adminUser);
            expect(result.role).toBe('admin');
        });
    });

    describe('normalizeUsers', () => {
        const mockUsers: User[] = [
            {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'password1',
                role: Role.USER,
                isActive: true,
                createdAt: new Date('2024-01-01'),
                updatedAt: new Date('2024-01-01'),
            },
            {
                id: '2',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane@example.com',
                password: 'password2',
                role: Role.ADMIN,
                isActive: true,
                createdAt: new Date('2024-01-02'),
                updatedAt: new Date('2024-01-02'),
            },
        ];

        it('should normalize an array of users', () => {
            const result = normalizeUsers(mockUsers);
            expect(result).toHaveLength(2);
        });

        it('should remove passwords from all users', () => {
            const result = normalizeUsers(mockUsers);
            result.forEach(user => {
                expect(user).not.toHaveProperty('password');
            });
        });

        it('should normalize roles for all users', () => {
            const result = normalizeUsers(mockUsers);
            expect(result[0].role).toBe('user');
            expect(result[1].role).toBe('admin');
        });

        it('should handle empty array', () => {
            const result = normalizeUsers([]);
            expect(result).toEqual([]);
        });
    });
});
