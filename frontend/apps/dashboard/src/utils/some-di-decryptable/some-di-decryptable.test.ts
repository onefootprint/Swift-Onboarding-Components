import someDiDecryptable from './some-di-decryptable';
import {
  emptyEntity,
  multipleDecryptableAttributesEntity,
  noDecryptableAttributesEntity,
  singleAttributeDecryptableEntity,
} from './some-di-decryptable.test.config';

describe('someDiDecryptable', () => {
  it('should return true if at least one attribute is decryptable', () => {
    const result = someDiDecryptable(singleAttributeDecryptableEntity);
    expect(result).toBe(true);
  });

  it('should return true if multiple attributes are decryptable', () => {
    const result = someDiDecryptable(multipleDecryptableAttributesEntity);
    expect(result).toBe(true);
  });

  it('should return false if no attributes are decryptable', () => {
    const result = someDiDecryptable(noDecryptableAttributesEntity);
    expect(result).toBe(false);
  });

  it('should return false if entity is undefined', () => {
    const result = someDiDecryptable(undefined);
    expect(result).toBe(false);
  });

  it('should return false if entity has no data', () => {
    const result = someDiDecryptable(emptyEntity);
    expect(result).toBe(false);
  });
});
