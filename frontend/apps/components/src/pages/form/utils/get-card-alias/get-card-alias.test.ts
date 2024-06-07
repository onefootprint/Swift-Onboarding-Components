import getCardAlias from './get-card-alias';

describe('getCardAlias', () => {
  it('should return correct alias', () => {
    expect(getCardAlias(['card.primary.number, card.primary.cvc'])).toBe('primary');
    expect(getCardAlias(['card.3453-2342242-dfkefec.number'])).toBe('3453-2342242-dfkefec');
  });

  it('should return null if no alias provided', () => {
    expect(getCardAlias([])).toBe(null);
    expect(getCardAlias([''])).toBe(null);
    expect(getCardAlias(['card.number'])).toBe(null);
    expect(getCardAlias(['card'])).toBe(null);
  });
});
