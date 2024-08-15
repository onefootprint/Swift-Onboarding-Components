import isSandboxFixtureNumber from './is-sandbox-fixture-number';

describe('isSandboxFixtureNumber', () => {
  it('should return true if the phone number is the sandbox fixture number', () => {
    expect(isSandboxFixtureNumber('+1 555-555-0100')).toBe(true);
    expect(isSandboxFixtureNumber('+1555-555-0100')).toBe(true);
    expect(isSandboxFixtureNumber('+15555550100')).toBe(true);
  });

  it('should return false if the phone number is not the sandbox fixture number', () => {
    expect(isSandboxFixtureNumber('+1 555-555-0101')).toBe(false);
    expect(isSandboxFixtureNumber('')).toBe(false);
  });
});
