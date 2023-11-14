import processFieldErrors from './process-field-errors';

describe('processFieldErrors', () => {
  it('extracts form field names correctly', () => {
    expect(
      processFieldErrors({
        'card.23423432.name': 'Invalid card name',
        'card.23423432.number': 'Invalid card number',
        'card.23423432.expiration': 'Invalid card expiration',
        'card.23423432.cvc': 'Invalid card cvc',
        'card.23423432.billing_address.country': 'Invalid card country',
        'card.23423432.billing_address.zip': 'Invalid card zip',
      }),
    ).toEqual({
      name: 'Invalid card name',
      number: 'Invalid card number',
      expiry: 'Invalid card expiration',
      cvc: 'Invalid card cvc',
      country: 'Invalid card country',
      zip: 'Invalid card zip',
    });
  });
});
