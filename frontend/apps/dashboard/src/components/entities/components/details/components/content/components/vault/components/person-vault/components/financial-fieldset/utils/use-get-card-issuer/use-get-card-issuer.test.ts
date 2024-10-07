import { customRenderHook } from '@onefootprint/test-utils';
import useGetCardIssuer from './use-get-card-issuer';

describe('useGetCardIssuer', () => {
  it('returns the correct translation for known card issuers', () => {
    const { result } = customRenderHook(() => useGetCardIssuer());
    const getCardIssuer = result.current;

    const element = getCardIssuer('visa');
    expect(element).toBe('Visa');

    const element2 = getCardIssuer('mastercard');
    expect(element2).toBe('MasterCard');

    const element3 = getCardIssuer('amex');
    expect(element3).toBe('American Express');
  });

  it('returns the base DI for untranslated card issuers', () => {
    const { result } = customRenderHook(() => useGetCardIssuer());
    const getCardIssuer = result.current;

    const element = getCardIssuer('chase_sapphire');
    expect(element).toBe('chase_sapphire');
  });
});
