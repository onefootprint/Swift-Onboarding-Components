import { renderHook } from '@onefootprint/test-utils';

import useIdentifierSuffix from './use-identifier-suffix';
import mockUseIdentifierSuffix from './use-identifier-suffix.test.config';

jest.mock('../../components/identify-machine-provider', () => ({
  __esModule: true,
  ...jest.requireActual('../../components/identify-machine-provider'),
}));

describe.skip('useIdentifierSuffix', () => {
  it('should append the suffix', () => {
    mockUseIdentifierSuffix('#fail123');
    const { result } = renderHook(() => useIdentifierSuffix());

    const result1 = result.current.append('jane@acme.com');
    expect(result1).toEqual('jane@acme.com#fail123');
  });

  it('should remove the suffix', () => {
    mockUseIdentifierSuffix('#fail123');
    const { result } = renderHook(() => useIdentifierSuffix());

    const result1 = result.current.remove('jane@acme.com#fail123');
    expect(result1).toEqual('jane@acme.com');
  });
});
