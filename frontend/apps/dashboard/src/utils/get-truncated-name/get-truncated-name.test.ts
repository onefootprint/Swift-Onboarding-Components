import getTruncatedName from './get-truncated-name';
import {
  attributesWithFnAndLnInitial,
  attributesWithFnEncrypted,
  attributesWithNoName,
  attributesWithOnlyFn,
  attributesWithOnlyLnInitial,
} from './get-truncated-name.test.config';

describe('get-truncated-name', () => {
  it('When fn and ln initial is present in the attributes, should show first name and last name initial', () => {
    const name = getTruncatedName(attributesWithFnAndLnInitial);
    expect(name).toEqual('Jane D.');
  });

  it('When only fn is present in the attributes, should show fn', () => {
    const name = getTruncatedName(attributesWithOnlyFn);
    expect(name).toEqual('Jane');
  });

  it('When no attributes are present, should show blank (-)', () => {
    const name = getTruncatedName(attributesWithNoName);
    expect(name).toEqual('-');
  });

  it('When only ln initial is present in the attributes, should show blank (-)', () => {
    const name = getTruncatedName(attributesWithOnlyLnInitial);
    expect(name).toEqual('-');
  });

  it('When fn is encrypted, should show blank (-)', () => {
    const name = getTruncatedName(attributesWithFnEncrypted);
    expect(name).toEqual('-');
  });
});
