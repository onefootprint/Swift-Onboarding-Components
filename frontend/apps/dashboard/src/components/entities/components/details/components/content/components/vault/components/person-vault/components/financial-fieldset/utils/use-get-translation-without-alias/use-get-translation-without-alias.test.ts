import { customRenderHook } from '@onefootprint/test-utils';
import useGetTranslationWithoutAlias from './use-get-translation-without-alias';

describe('useGetTranslationWithoutAlias', () => {
  describe('Card DIs', () => {
    it('should return the correct translation for card.alias.name', () => {
      const { result } = customRenderHook(() => useGetTranslationWithoutAlias());
      expect(result.current('card.alias.name')).toBe('Name on card');
    });

    it('should return the correct translation for card.alias.number', () => {
      const { result } = customRenderHook(() => useGetTranslationWithoutAlias());
      expect(result.current('card.alias.number')).toBe('Card number');
    });

    it('should return the correct translation for card.alias.expiration', () => {
      const { result } = customRenderHook(() => useGetTranslationWithoutAlias());
      expect(result.current('card.alias.expiration')).toBe('Expiration');
    });

    it('should return the correct translation for card.alias.billing_address.zip', () => {
      const { result } = customRenderHook(() => useGetTranslationWithoutAlias());
      expect(result.current('card.alias.billing_address.zip')).toBe('Card billing address (Zip code)');
    });

    it('should return the correct translation for card.alias.cvc', () => {
      const { result } = customRenderHook(() => useGetTranslationWithoutAlias());
      expect(result.current('card.alias.cvc')).toBe('Security code (CVC)');
    });
  });

  describe('Bank DIs', () => {
    it('should return the correct translation for bank.alias.name', () => {
      const { result } = customRenderHook(() => useGetTranslationWithoutAlias());
      expect(result.current('bank.alias.name')).toBe('Name');
    });

    it('should return the correct translation for bank.alias.account_type', () => {
      const { result } = customRenderHook(() => useGetTranslationWithoutAlias());
      expect(result.current('bank.alias.account_type')).toBe('Account type');
    });

    it('should return the correct translation for bank.alias.ach_routing_number', () => {
      const { result } = customRenderHook(() => useGetTranslationWithoutAlias());
      expect(result.current('bank.alias.ach_routing_number')).toBe('ACH routing number');
    });

    it('should return the correct translation for bank.alias.ach_account_number', () => {
      const { result } = customRenderHook(() => useGetTranslationWithoutAlias());
      expect(result.current('bank.alias.ach_account_number')).toBe('ACH account number');
    });

    it('should return the correct translation for bank.alias.ach_account_id', () => {
      const { result } = customRenderHook(() => useGetTranslationWithoutAlias());
      expect(result.current('bank.alias.ach_account_id')).toBe('ACH account ID');
    });
  });
});
