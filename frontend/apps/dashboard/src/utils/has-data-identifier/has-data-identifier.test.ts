import { BusinessDI, IdDI } from '@onefootprint/types';
import hasDataIdentifier from './has-data-identifier';
import { entityFixture } from './has-data-identifier.test.config';

describe('hasDataIdentifier', () => {
  it('should return true for existing data identifiers', () => {
    expect(hasDataIdentifier(entityFixture, IdDI.email)).toBe(true);
    expect(hasDataIdentifier(entityFixture, IdDI.phoneNumber)).toBe(true);
    expect(hasDataIdentifier(entityFixture, BusinessDI.name)).toBe(true);
    expect(hasDataIdentifier(entityFixture, IdDI.ssn9)).toBe(true);
    expect(hasDataIdentifier(entityFixture, BusinessDI.tin)).toBe(true);
  });

  it('should return false for non-existing data identifiers', () => {
    expect(hasDataIdentifier(entityFixture, IdDI.firstName)).toBe(false);
    expect(hasDataIdentifier(entityFixture, BusinessDI.website)).toBe(false);
  });

  it('should return false if entity is undefined', () => {
    expect(hasDataIdentifier(undefined, IdDI.email)).toBe(false);
  });

  it('should return false if dataIdentifier is undefined', () => {
    expect(hasDataIdentifier(entityFixture, undefined)).toBe(false);
  });

  it('should return false if both entity and dataIdentifier are undefined', () => {
    expect(hasDataIdentifier(undefined, undefined)).toBe(false);
  });
});
