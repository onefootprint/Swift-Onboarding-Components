import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { renderHook } from '@onefootprint/test-utils';
import useDITranslation from './use-di-translation';

describe('useDITranslation', () => {
  describe('ID DIs', () => {
    it('translates first name', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('id.first_name')).toBe('First name');
    });

    it('translates last name', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('id.last_name')).toBe('Last name');
    });

    it('translates email', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('id.email')).toBe('Email');
    });
  });

  describe('Business DIs', () => {
    it('translates business name', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('business.name')).toBe('Business name');
    });

    it('translates DBA', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('business.dba')).toBe('Doing Business As');
    });

    it('translates TIN', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('business.tin')).toBe('TIN (EIN)');
    });
  });

  describe('Investor Profile DIs', () => {
    it('translates employment status', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('investor_profile.employment_status')).toBe('Employment status');
    });

    it('translates occupation', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('investor_profile.occupation')).toBe('Occupation');
    });
  });

  describe('Document DIs', () => {
    it('translates passport', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('document.passport.front.image')).toBe('Passport');
    });

    it('translates passport selfie', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('document.passport.selfie.image')).toBe('Selfie');
    });

    it('handles versioned documents', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('document.passport.front.image:v1' as DataIdentifier)).toBe('Passport');
      expect(result.current.translateDI('document.passport.selfie.image:v2' as DataIdentifier)).toBe('Selfie');
    });
  });

  describe('Card DIs', () => {
    it('translates card name for first card', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('card.1.name' as DataIdentifier)).toBe('Name on card');
    });

    it('translates card name for second card', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('card.2.name' as DataIdentifier)).toBe('Name on card');
    });
  });

  describe('Bank DIs', () => {
    it('translates bank name for first account', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('bank.1.name' as DataIdentifier)).toBe('Name');
    });

    it('translates bank name for second account', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('bank.2.name' as DataIdentifier)).toBe('Name');
    });
  });

  describe('Custom DIs', () => {
    it('translates custom field', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI('custom.test' as DataIdentifier)).toBe('test');
    });
  });
});
