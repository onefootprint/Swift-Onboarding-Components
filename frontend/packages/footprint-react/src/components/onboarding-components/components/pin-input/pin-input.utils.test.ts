import { describe, expect, it } from 'bun:test';
import { getNextValue, isNumber } from './pin-input.utils';

describe('pin-input utils', () => {
  describe('isNumber', () => {
    it('should return true for valid numeric strings', () => {
      expect(isNumber('0')).toBe(true);
      expect(isNumber('1')).toBe(true);
      expect(isNumber('123')).toBe(true);
      expect(isNumber('9999')).toBe(true);
    });

    it('should return false for non-numeric strings', () => {
      expect(isNumber('')).toBe(false);
      expect(isNumber('a')).toBe(false);
      expect(isNumber('1a')).toBe(false);
      expect(isNumber('1.2')).toBe(false);
      expect(isNumber('-1')).toBe(false);
      expect(isNumber(' ')).toBe(false);
    });
  });

  describe('getNextValue', () => {
    it('should return eventValue when current value is empty', () => {
      expect(getNextValue('', '1')).toBe('1');
      expect(getNextValue('', '9')).toBe('9');
    });

    it('should handle single character input correctly', () => {
      expect(getNextValue('1', '1')).toBe('1');
      expect(getNextValue('2', '3')).toBe('3');
    });

    it('should handle double character input when first characters match', () => {
      expect(getNextValue('1', '12')).toBe('2');
      expect(getNextValue('5', '56')).toBe('6');
    });

    it('should handle double character input when second characters match', () => {
      expect(getNextValue('2', '12')).toBe('1');
      expect(getNextValue('6', '56')).toBe('5');
    });

    it('should return full eventValue when no characters match', () => {
      expect(getNextValue('1', '34')).toBe('34');
      expect(getNextValue('5', '78')).toBe('78');
    });
  });
});
