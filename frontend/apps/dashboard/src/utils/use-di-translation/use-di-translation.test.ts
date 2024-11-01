import { renderHook } from '@onefootprint/test-utils';
import { BusinessDI, type DataIdentifier, DocumentDI, IdDI, InvestorProfileDI } from '@onefootprint/types';
import { useDITranslation } from './use-di-translation';

describe('useDITranslation', () => {
  describe('ID DIs', () => {
    it('translates first name', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI(IdDI.firstName)).toBe('First name');
    });

    it('translates last name', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI(IdDI.lastName)).toBe('Last name');
    });

    it('translates email', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI(IdDI.email)).toBe('Email');
    });
  });

  describe('Business DIs', () => {
    it('translates business name', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI(BusinessDI.name)).toBe('Business name');
    });

    it('translates DBA', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI(BusinessDI.doingBusinessAs)).toBe('Doing Business As');
    });

    it('translates TIN', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI(BusinessDI.tin)).toBe('TIN (EIN)');
    });
  });

  describe('Investor Profile DIs', () => {
    it('translates employment status', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI(InvestorProfileDI.employmentStatus)).toBe('Employment status');
    });

    it('translates occupation', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI(InvestorProfileDI.occupation)).toBe('Occupation');
    });
  });

  describe('Document DIs', () => {
    it('translates passport', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI(DocumentDI.latestPassport)).toBe('Passport');
    });

    it('translates passport selfie', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI(DocumentDI.latestPassportSelfie)).toBe('Passport selfie');
    });

    it('handles versioned documents', () => {
      const { result } = renderHook(() => useDITranslation());
      expect(result.current.translateDI(`${DocumentDI.latestPassport}:v1` as DataIdentifier)).toBe('Passport');
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
