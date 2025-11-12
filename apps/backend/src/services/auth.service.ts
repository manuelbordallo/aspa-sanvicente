import userRepository from '../repositories/user.repository';
import passwordResetRepository from '../repositories/password-reset.repository';
import { comparePassword, hashPassword, validatePasswordStrength } from '../utils/password.util';
import { generateToken, generateRefreshToken, verifyToken, JWTPayload } from '../utils/jwt.util';
import { normalizeUser, NormalizedUser } from '../utils/user.util';
import { randomUUID } from 'crypto';

export interface LoginResult {
  user: NormalizedUser;
  token: string;
  refreshToken: string;
}

export interface ValidateTokenResult {
  user: NormalizedUser;
}

class AuthService {
  /**
   * Login with email and password
   * Validates credentials, generates JWT, and returns user with token
   */
  async login(email: string, password: string): Promise<LoginResult> {
    // Find user by email
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT tokens
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role.toLowerCase() as 'admin' | 'user',
    };

    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: normalizeUser(user),
      token,
      refreshToken,
    };
  }

  /**
   * Validate JWT token and return user data
   */
  async validateToken(token: string): Promise<ValidateTokenResult> {
    // Verify token
    const decoded = verifyToken(token);

    // Get fresh user data from database
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    return {
      user: normalizeUser(user),
    };
  }

  /**
   * Generate new JWT from valid refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);

    // Get user from database
    const user = await userRepository.findById(decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Generate new tokens
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role.toLowerCase() as 'admin' | 'user',
    };

    const newToken = generateToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Change password for authenticated user
   * Validates current password and updates with new hashed password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get user
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    if (!validatePasswordStrength(newPassword)) {
      throw new Error('Password must be at least 8 characters long and contain letters and numbers');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await userRepository.update(userId, { password: hashedPassword });
  }

  /**
   * Request password reset
   * Generates reset token and returns it (email sending handled by email service)
   */
  async requestPasswordReset(email: string): Promise<{ token: string; userId: string }> {
    // Find user by email
    const user = await userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists or not for security
      throw new Error('If the email exists, a reset link will be sent');
    }

    // Generate reset token
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    // Save token to database
    await passwordResetRepository.create({
      userId: user.id,
      token,
      expiresAt,
    });

    return { token, userId: user.id };
  }

  /**
   * Reset password using reset token
   * Validates token and updates password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find reset token
    const resetToken = await passwordResetRepository.findByToken(token);

    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Check if token is already used
    if (resetToken.used) {
      throw new Error('Reset token has already been used');
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      throw new Error('Reset token has expired');
    }

    // Validate new password strength
    if (!validatePasswordStrength(newPassword)) {
      throw new Error('Password must be at least 8 characters long and contain letters and numbers');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await userRepository.update(resetToken.userId, { password: hashedPassword });

    // Mark token as used
    await passwordResetRepository.markAsUsed(resetToken.id);
  }
}

export default new AuthService();
