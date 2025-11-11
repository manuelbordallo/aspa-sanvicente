import prisma from '../config/database';
import { Role, User } from '@prisma/client';
import { PaginationParams } from '../utils/pagination.util';

export interface UserFilters {
  role?: Role;
  isActive?: boolean;
  search?: string;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: Role;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: Role;
  isActive?: boolean;
}

class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find all users with pagination, filtering, and sorting
   */
  async findAll(
    pagination: PaginationParams,
    filters?: UserFilters
  ): Promise<{ users: User[]; total: number }> {
    const where: any = {};

    // Apply filters
    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    if (pagination.sortBy) {
      orderBy[pagination.sortBy] = pagination.sortOrder;
    } else {
      orderBy.createdAt = pagination.sortOrder;
    }

    // Execute queries
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  /**
   * Create new user
   */
  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role || Role.USER,
      },
    });
  }

  /**
   * Update user data
   */
  async update(id: string, data: UpdateUserData): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivate(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export default new UserRepository();
