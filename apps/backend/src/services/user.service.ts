import userRepository, { CreateUserData, UpdateUserData, UserFilters } from '../repositories/user.repository';
import { hashPassword, validatePasswordStrength } from '../utils/password.util';
import { PaginationParams, PaginationResult } from '../utils/pagination.util';
import { normalizeUser, normalizeUsers, NormalizedUser } from '../utils/user.util';

class UserService {
  /**
   * Get users with pagination and filtering
   */
  async getUsers(
    pagination: PaginationParams,
    filters?: UserFilters
  ): Promise<PaginationResult<NormalizedUser>> {
    const { users, total } = await userRepository.findAll(pagination, filters);

    // Normalize users (remove passwords and normalize roles)
    const normalizedUsers = normalizeUsers(users);

    return {
      data: normalizedUsers,
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
  async getUserById(id: string): Promise<NormalizedUser> {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    // Normalize user (remove password and normalize role)
    return normalizeUser(user);
  }

  /**
   * Create new user with email uniqueness check and password hashing
   */
  async createUser(data: CreateUserData): Promise<NormalizedUser> {
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

    // Normalize user (remove password and normalize role)
    return normalizeUser(user);
  }

  /**
   * Update user with validation
   */
  async updateUser(id: string, data: UpdateUserData): Promise<NormalizedUser> {
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

    // Normalize user (remove password and normalize role)
    return normalizeUser(user);
  }

  /**
   * Deactivate user (soft delete)
   */
  async deactivateUser(id: string): Promise<NormalizedUser> {
    // Check if user exists
    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Deactivate user
    const user = await userRepository.deactivate(id);

    // Normalize user (remove password and normalize role)
    return normalizeUser(user);
  }
}

export default new UserService();
