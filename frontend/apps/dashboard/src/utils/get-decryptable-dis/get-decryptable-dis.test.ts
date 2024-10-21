import { BusinessDI, IdDI } from '@onefootprint/types';
import getDecryptableDIs from './get-decryptable-dis';
import {
  emptyEntity,
  multipleDecryptableAttributesEntity,
  noDecryptableAttributesEntity,
  singleAttributeDecryptableEntity,
} from './get-decryptable-dis.test.config';

describe('getDecryptableDIs', () => {
  it('returns an empty array when entity is undefined', () => {
    const result = getDecryptableDIs(undefined);
    expect(result).toEqual([]);
  });

  it('returns an empty array when entity has no data', () => {
    const result = getDecryptableDIs(emptyEntity);
    expect(result).toEqual([]);
  });

  it('returns an empty array when entity has no decryptable attributes', () => {
    const result = getDecryptableDIs(noDecryptableAttributesEntity);
    expect(result).toEqual([]);
  });

  it('returns an array with one DataIdentifier when entity has one decryptable attribute', () => {
    const result = getDecryptableDIs(singleAttributeDecryptableEntity);
    expect(result).toEqual([IdDI.email]);
  });

  it('returns an array with multiple DataIdentifiers when entity has multiple decryptable attributes', () => {
    const result = getDecryptableDIs(multipleDecryptableAttributesEntity);
    expect(result).toEqual([IdDI.email, IdDI.phoneNumber, BusinessDI.website]);
  });
});
