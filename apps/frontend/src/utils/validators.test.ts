import { expect } from '@esm-bundle/chai';
import { ValidationService } from './validators.js';

describe('ValidationService', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(ValidationService.validateEmail('test@example.com')).to.be.true;
      expect(ValidationService.validateEmail('user.name@domain.co.uk')).to.be
        .true;
      expect(ValidationService.validateEmail('user+tag@example.org')).to.be
        .true;
    });

    it('should reject invalid email formats', () => {
      expect(ValidationService.validateEmail('invalid-email')).to.be.false;
      expect(ValidationService.validateEmail('test@')).to.be.false;
      expect(ValidationService.validateEmail('@example.com')).to.be.false;
      expect(ValidationService.validateEmail('test..test@example.com')).to.be
        .false;
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = ValidationService.validatePassword('Password123');
      expect(result.isValid).to.be.true;
      expect(result.errors).to.have.length(0);
    });

    it('should reject weak passwords', () => {
      const result = ValidationService.validatePassword('weak');
      expect(result.isValid).to.be.false;
      expect(result.errors).to.include(
        'La contraseña debe tener al menos 8 caracteres'
      );
      expect(result.errors).to.include(
        'La contraseña debe contener al menos una letra mayúscula'
      );
      expect(result.errors).to.include(
        'La contraseña debe contener al menos un número'
      );
    });
  });

  describe('validateRequired', () => {
    it('should validate non-empty values', () => {
      const result = ValidationService.validateRequired('test', 'Campo');
      expect(result.isValid).to.be.true;
      expect(result.errors).to.have.length(0);
    });

    it('should reject empty values', () => {
      const result = ValidationService.validateRequired('', 'Campo');
      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Campo es requerido');
    });
  });

  describe('validateUserRole', () => {
    it('should validate correct roles', () => {
      expect(ValidationService.validateUserRole('user')).to.be.true;
      expect(ValidationService.validateUserRole('admin')).to.be.true;
    });

    it('should reject invalid roles', () => {
      expect(ValidationService.validateUserRole('invalid')).to.be.false;
      expect(ValidationService.validateUserRole('superuser')).to.be.false;
    });
  });

  describe('validateTheme', () => {
    it('should validate correct themes', () => {
      expect(ValidationService.validateTheme('light')).to.be.true;
      expect(ValidationService.validateTheme('dark')).to.be.true;
      expect(ValidationService.validateTheme('system')).to.be.true;
    });

    it('should reject invalid themes', () => {
      expect(ValidationService.validateTheme('invalid')).to.be.false;
      expect(ValidationService.validateTheme('blue')).to.be.false;
    });
  });
});
