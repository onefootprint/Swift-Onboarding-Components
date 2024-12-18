import formatState from './format-state';

describe('formatState', () => {
  it('should return a dash for invalid state abbreviations', () => {
    const invalidStates = ['', 'F', '123'];
    invalidStates.forEach(str => {
      expect(formatState(str)).toBe('-');
    });
  });

  it('should return the correct full name for valid state abbreviations', () => {
    expect(formatState('FL')).toBe('Florida');
    expect(formatState('DE')).toBe('Delaware');
    expect(formatState('WY')).toBe('Wyoming');
  });
});
