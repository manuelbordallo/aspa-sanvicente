import bcrypt from 'bcrypt';
import config from '../config';

/**
 * Hash a plain text password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.security.bcryptSaltRounds);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password to verify
 * @param hashedPassword - Hashed password to compare against
 * @returns True if passwords match, false otherwise
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Validate password strength requirements
 * - Minimum 8 characters
 * - Must contain at least one letter
 * - Must contain at least one number
 * @param password - Password to validate
 * @returns True if password meets requirements, false otherwise
 */
export function validatePasswordStrength(password: string): boolean {
  if (password.length < 8) {
    return false;
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasLetter && hasNumber;
}

/**
 * Get password validation error message
 * @param password - Password to validate
 * @returns Error message if invalid, null if valid
 */
export function getPasswordValidationError(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter) {
    return 'Password must contain at least one letter';
  }

  if (!hasNumber) {
    return 'Password must contain at least one number';
  }

  return null;
}
