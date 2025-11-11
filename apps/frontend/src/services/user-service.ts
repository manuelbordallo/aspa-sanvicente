import { apiClient } from './api-client.js';
import type {
  User,
  UserFormData,
  UserRole,
  ApiResponse,
  PaginatedResponse,
} from '../types/index.js';

export interface UserFilters {
  role?: UserRole;
  search?: string;
  isActive?: boolean;
}

export interface UserPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt' | 'role';
  sortOrder?: 'asc' | 'desc';
}

export class UserService {
  /**
   * Get all users with optional pagination and filters (admin only)
   */
  async getUsers(
    options: UserPaginationOptions = {},
    filters: UserFilters = {}
  ): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();

    // Add pagination options
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    // Add filters
    if (filters.role) params.append('role', filters.role);
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined)
      params.append('isActive', filters.isActive.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';

    const response: ApiResponse<PaginatedResponse<User>> =
      await apiClient.get(endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al obtener los usuarios');
    }

    // Convert date strings to Date objects
    response.data.data = response.data.data.map((user) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    }));

    return response.data;
  }

  /**
   * Get a single user by ID
   */
  async getUserById(id: string): Promise<User> {
    const response: ApiResponse<User> = await apiClient.get(`/users/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Usuario no encontrado');
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  }

  /**
   * Create a new user (admin only)
   */
  async createUser(userData: UserFormData): Promise<User> {
    const response: ApiResponse<User> = await apiClient.post(
      '/users',
      userData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al crear el usuario');
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  }

  /**
   * Update an existing user (admin only or own profile)
   */
  async updateUser(id: string, userData: Partial<UserFormData>): Promise<User> {
    const response: ApiResponse<User> = await apiClient.put(
      `/users/${id}`,
      userData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al actualizar el usuario');
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  }

  /**
   * Delete a user (admin only)
   */
  async deleteUser(id: string): Promise<void> {
    const response: ApiResponse<void> = await apiClient.delete(`/users/${id}`);

    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar el usuario');
    }
  }

  /**
   * Change user role (admin only)
   */
  async changeUserRole(id: string, role: UserRole): Promise<User> {
    const response: ApiResponse<User> = await apiClient.patch(
      `/users/${id}/role`,
      { role }
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Error al cambiar el rol del usuario'
      );
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  }

  /**
   * Activate/deactivate a user (admin only)
   */
  async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    const response: ApiResponse<User> = await apiClient.patch(
      `/users/${id}/status`,
      { isActive }
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Error al cambiar el estado del usuario'
      );
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
    };
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    const response = await this.getUsers(
      { limit, sortBy: 'firstName', sortOrder: 'asc' },
      { search: query }
    );

    return response.data;
  }

  /**
   * Get users by role
   */
  async getUsersByRole(
    role: UserRole,
    options: UserPaginationOptions = {}
  ): Promise<PaginatedResponse<User>> {
    return this.getUsers(options, { role });
  }

  /**
   * Get all admins
   */
  async getAdmins(): Promise<User[]> {
    const response = await this.getUsersByRole('admin');
    return response.data;
  }

  /**
   * Get all regular users
   */
  async getRegularUsers(): Promise<User[]> {
    const response = await this.getUsersByRole('user');
    return response.data;
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStats(): Promise<{
    total: number;
    admins: number;
    users: number;
    active: number;
    inactive: number;
    recentRegistrations: number;
  }> {
    const response: ApiResponse<{
      total: number;
      admins: number;
      users: number;
      active: number;
      inactive: number;
      recentRegistrations: number;
    }> = await apiClient.get('/users/stats');

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Error al obtener las estadísticas de usuarios'
      );
    }

    return response.data;
  }

  /**
   * Reset user password (admin only)
   */
  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    const response: ApiResponse<void> = await apiClient.patch(
      `/users/${id}/reset-password`,
      {
        password: newPassword,
      }
    );

    if (!response.success) {
      throw new Error(
        response.message || 'Error al restablecer la contraseña del usuario'
      );
    }
  }

  /**
   * Send password reset email to user (admin only)
   */
  async sendPasswordResetEmail(id: string): Promise<void> {
    const response: ApiResponse<void> = await apiClient.post(
      `/users/${id}/send-reset-email`
    );

    if (!response.success) {
      throw new Error(
        response.message || 'Error al enviar el email de restablecimiento'
      );
    }
  }

  /**
   * Get users for notice recipients (simplified user data)
   */
  async getUsersForNotices(): Promise<
    Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>[]
  > {
    const response: ApiResponse<
      Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>[]
    > = await apiClient.get('/users/for-notices');

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Error al obtener los usuarios para avisos'
      );
    }

    return response.data;
  }

  /**
   * Bulk update users (admin only)
   */
  async bulkUpdateUsers(
    userIds: string[],
    updates: Partial<Pick<User, 'role' | 'isActive'>>
  ): Promise<User[]> {
    const response: ApiResponse<User[]> = await apiClient.patch(
      '/users/bulk-update',
      {
        userIds,
        updates,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al actualizar los usuarios');
    }

    // Convert date strings to Date objects
    return response.data.map((user) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    }));
  }
}

// Create and export default instance
export const userService = new UserService();
