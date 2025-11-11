import { User } from '@prisma/client';
import userRepository, { CreateUserData, UpdateUserData, UserFilters } from '../repositories/user.repository';
import { hashPassword, validatePasswordStrength } from '../utils/password.util';
import { PaginationParams, PaginationResult } from '../utils/pagination.util';

class UserService {
  /**
   * Get users with pagination and filtering
   */
  async getUsers(
    pagination: PaginationParams,
    filters?: UserFilters
  ): Promise<PaginationResult<Omit<User, 'password'>>> {
    const { users, total } = await userRepository.findAll(pagination, filters);

    // Remove passwords from user objects
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return {
      data: usersWithoutPasswords,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      hasNext: pagination.skip + pagination.limit < total,
      hasPrev: pagination.page > 1,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<Omit<User, 'password'>> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  /**
   * Create new user with email uniqueness check and password hashing
   */
  async createUser(data: CreateUserData): Promise<Omit<User, 'password'>> {
    // Check email uniqueness
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Validate password strength
    if (!validatePasswordStrength(data.password)) {
      throw new Error('Password must be at least 8 characters long and contain letters and numbers');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await userRepository.create({
      ...data,
      password: hashedPassword,
    });

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  /**
   * Update user with validation
   */
  async updateUser(id: string, data: UpdateUserData): Promise<Omit<User, 'password'>> {
    // Check if user exists
    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      throw new Error('User not found');
    }

    // If email is being updated, check uniqueness
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await userRepository.findByEmail(data.email);
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    // If password is being updated, validate and hash it
    if (data.password) {
      if (!validatePasswordStrength(data.password)) {
        throw new Error('Password must be at least 8 characters long and contain letters and numbers');
      }
      data.password = await hashPassword(data.password);
    }

    // Update user
    const user = await userRepository.update(id, data);

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(id: string): Promise<Omit<User, 'password'>> {
    // Check if user exists
    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Deactivate user
    const user = await userRepository.deactivate(id);

    // Remove password from user object
    const { password, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}

export default new UserService();
