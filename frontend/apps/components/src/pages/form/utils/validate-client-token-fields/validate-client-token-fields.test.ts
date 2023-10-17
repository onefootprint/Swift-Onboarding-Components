import { FootprintFormType } from '@onefootprint/footprint-js';

import validateClientTokenFields from './validate-client-token-fields';

describe('validateClientTokenFields', () => {
  let consoleErrorSpy = jest.spyOn(console, 'error');

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return true when fields are valid', () => {
    expect(
      validateClientTokenFields(FootprintFormType.cardOnly, [
        'card.primary.number',
        'card.primary.cvc',
        'card.primary.expiration',
      ]),
    ).toEqual(true);

    expect(
      validateClientTokenFields(FootprintFormType.cardOnly, [
        'card.primary.number',
        'card.primary.cvc',
        'card.primary.name',
        'card.primary.expiration',
        'card.primary.billing_address.country',
      ]),
    ).toEqual(true);

    expect(
      validateClientTokenFields(FootprintFormType.cardAndNameAndAddress, [
        'card.primary.number',
        'card.primary.cvc',
        'card.primary.expiration',
        'card.primary.name',
        'card.primary.billing_address.country',
        'card.primary.billing_address.zip',
      ]),
    ).toEqual(true);

    expect(
      validateClientTokenFields(FootprintFormType.cardAndZip, [
        'card.primary.number',
        'card.primary.cvc',
        'card.primary.expiration',
        'card.primary.billing_address.zip',
        'card.primary.billing_address.country',
      ]),
    ).toEqual(true);
  });

  it('should return false when fields are invalid', () => {
    expect(
      validateClientTokenFields(FootprintFormType.cardAndName, [
        'card.primary.number',
      ]),
    ).toEqual(false);

    expect(
      validateClientTokenFields(FootprintFormType.cardAndZip, [
        'card.primary.number',
        'card.primary.cvc',
        'card.primary.expiration',
      ]),
    ).toEqual(false);

    expect(
      validateClientTokenFields(FootprintFormType.cardAndZip, [
        'card.primary.billing_address.zip',
      ]),
    ).toEqual(false);

    expect(validateClientTokenFields(FootprintFormType.cardOnly, [])).toEqual(
      false,
    );

    expect(
      validateClientTokenFields(FootprintFormType.cardAndNameAndAddress, [
        'card.primary.name',
        'card.primary.billing_address.country',
        'card.primary.billing_address.zip',
      ]),
    ).toEqual(false);
  });
});
