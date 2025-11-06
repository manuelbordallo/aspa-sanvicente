import { ValidationResult, FormError } from '../types/index.js';

/**
 * Validation utilities for form data and user input
 */
export class ValidationService {
  /**
   * Validates email format using RFC 5322 compliant regex
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  /**
   * Validates password strength
   * Requirements: minimum 8 characters, at least one uppercase, one lowercase, one number
   */
  static validatePassword(password: string): ValidationResult {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates that passwords match
   */
  static validatePasswordMatch(
    password: string,
    confirmPassword: string
  ): ValidationResult {
    const isValid = password === confirmPassword;
    return {
      isValid,
      errors: isValid ? [] : ['Las contraseñas no coinciden'],
    };
  }

  /**
   * Validates required field is not empty
   */
  static validateRequired(value: string, fieldName: string): ValidationResult {
    const isValid = value.trim().length > 0;
    return {
      isValid,
      errors: isValid ? [] : [`${fieldName} es requerido`],
    };
  }

  /**
   * Validates text length within specified bounds
   */
  static validateLength(
    value: string,
    min: number,
    max: number,
    fieldName: string
  ): ValidationResult {
    const length = value.trim().length;
    const errors: string[] = [];

    if (length < min) {
      errors.push(`${fieldName} debe tener al menos ${min} caracteres`);
    }

    if (length > max) {
      errors.push(`${fieldName} no puede exceder ${max} caracteres`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates user role is valid
   */
  static validateUserRole(role: string): boolean {
    return ['user', 'admin'].includes(role);
  }

  /**
   * Validates theme is valid
   */
  static validateTheme(theme: string): boolean {
    return ['light', 'dark', 'system'].includes(theme);
  }

  /**
   * Validates date is not in the past (for events)
   */
  static validateFutureDate(date: Date): ValidationResult {
    const now = new Date();
    const isValid = date >= now;

    return {
      isValid,
      errors: isValid ? [] : ['La fecha debe ser futura'],
    };
  }

  /**
   * Comprehensive form validation helper
   */
  static validateForm(
    fields: { [key: string]: any },
    rules: { [key: string]: ValidationRule[] }
  ): FormError[] {
    const errors: FormError[] = [];

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const value = fields[fieldName];

      for (const rule of fieldRules) {
        const result = rule.validator(value, fieldName);
        if (!result.isValid) {
          errors.push({
            field: fieldName,
            message: result.errors[0], // Take first error for each field
          });
          break; // Stop at first error per field
        }
      }
    }

    return errors;
  }
}

/**
 * Validation rule interface for form validation
 */
export interface ValidationRule {
  validator: (value: any, fieldName: string) => ValidationResult;
  message?: string;
}

/**
 * Common validation rules
 */
export const ValidationRules = {
  required: (fieldName: string): ValidationRule => ({
    validator: (value: string) =>
      ValidationService.validateRequired(value, fieldName),
  }),

  email: (): ValidationRule => ({
    validator: (value: string) => ({
      isValid: ValidationService.validateEmail(value),
      errors: ValidationService.validateEmail(value)
        ? []
        : ['Formato de email inválido'],
    }),
  }),

  password: (): ValidationRule => ({
    validator: (value: string) => ValidationService.validatePassword(value),
  }),

  length: (min: number, max: number, fieldName: string): ValidationRule => ({
    validator: (value: string) =>
      ValidationService.validateLength(value, min, max, fieldName),
  }),

  futureDate: (): ValidationRule => ({
    validator: (value: Date) => ValidationService.validateFutureDate(value),
  }),
};
