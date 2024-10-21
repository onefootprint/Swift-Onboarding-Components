import hasSomeDiDecryptable from './has-some-di-decryptable';
import {
  emptyEntity,
  multipleDecryptableAttributesEntity,
  noDecryptableAttributesEntity,
  singleAttributeDecryptableEntity,
} from './has-some-di-decryptable.test.config';

describe('hasSomeDiDecryptable', () => {
  it('should return true if at least one attribute is decryptable', () => {
    const result = hasSomeDiDecryptable(singleAttributeDecryptableEntity);
    expect(result).toBe(true);
  });

  it('should return true if multiple attributes are decryptable', () => {
    const result = hasSomeDiDecryptable(multipleDecryptableAttributesEntity);
    expect(result).toBe(true);
  });

  it('should return false if no attributes are decryptable', () => {
    const result = hasSomeDiDecryptable(noDecryptableAttributesEntity);
    expect(result).toBe(false);
  });

  it('should return false if entity is undefined', () => {
    const result = hasSomeDiDecryptable(undefined);
    expect(result).toBe(false);
  });

  it('should return false if entity has no data', () => {
    const result = hasSomeDiDecryptable(emptyEntity);
    expect(result).toBe(false);
  });
});
