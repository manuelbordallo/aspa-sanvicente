import prisma from '../config/database';
import { PasswordResetToken } from '@prisma/client';

export interface CreatePasswordResetData {
    userId: string;
    token: string;
    expiresAt: Date;
}

class PasswordResetRepository {
    /**
     * Create password reset token
     */
    async create(data: CreatePasswordResetData): Promise<PasswordResetToken> {
        return prisma.passwordResetToken.create({
            data: {
                userId: data.userId,
                token: data.token,
                expiresAt: data.expiresAt,
            },
        });
    }

    /**
     * Find password reset token by token string
     */
    async findByToken(token: string): Promise<PasswordResetToken | null> {
        return prisma.passwordResetToken.findUnique({
            where: { token },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        }) as Promise<PasswordResetToken | null>;
    }

    /**
     * Mark token as used
     */
    async markAsUsed(id: string): Promise<PasswordResetToken> {
        return prisma.passwordResetToken.update({
            where: { id },
            data: { used: true },
        });
    }

    /**
     * Delete expired tokens (cleanup)
     */
    async deleteExpired(): Promise<number> {
        const result = await prisma.passwordResetToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        return result.count;
    }
}

export default new PasswordResetRepository();
