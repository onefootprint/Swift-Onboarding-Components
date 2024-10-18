import { BusinessDI, type DataIdentifier, IdDI } from '@onefootprint/types';

import isDiDecryptable from './is-di-decryptable';
import { entityFixture } from './is-di-decryptable.test.config';

describe('isDiDecryptable', () => {
  it('should return true for decryptable attributes', () => {
    const result = isDiDecryptable(entityFixture, IdDI.email);
    expect(result).toBe(true);
  });

  it('should return false for non-decryptable attributes', () => {
    const result = isDiDecryptable(entityFixture, BusinessDI.name);
    expect(result).toBe(false);
  });

  it('should return false if entity is undefined', () => {
    const result = isDiDecryptable(undefined, IdDI.email);
    expect(result).toBe(false);
  });

  it('should return false if dataIdentifier is undefined', () => {
    const result = isDiDecryptable(entityFixture, undefined);
    expect(result).toBe(false);
  });

  it('should return false if attribute is not found in entity data', () => {
    const result = isDiDecryptable(entityFixture, 'nonexistent' as DataIdentifier);
    expect(result).toBe(false);
  });
});
