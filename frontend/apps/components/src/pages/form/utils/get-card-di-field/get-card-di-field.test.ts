import getCardDIField from './get-card-di-field';

describe('getCardDIField', () => {
  it('extracts field names correctly', () => {
    expect(getCardDIField('card.primary.number')).toEqual('number');

    expect(getCardDIField('card.primary.cvc')).toEqual('cvc');

    expect(getCardDIField('card.primary.expiration')).toEqual('expiration');

    expect(getCardDIField('card.345t43543.name')).toEqual('name');

    expect(getCardDIField('card.345t43543.expiration')).toEqual('expiration');

    expect(getCardDIField('card.345t43543.billing_address.country')).toEqual('billing_address.country');

    expect(getCardDIField('card.345t43543.billing_address.zip')).toEqual('billing_address.zip');
  });
});
