import { act, customRenderHook } from '@onefootprint/test-utils';
import { asAdminUserInSandbox, resetUser } from 'src/config/tests';

import useOrgSession from './use-org-session';

describe('useOrgSession', () => {
  beforeEach(() => {
    asAdminUserInSandbox();
  });

  afterAll(() => {
    resetUser();
  });

  it('should return the data', () => {
    const { result } = customRenderHook(() => useOrgSession());

    expect(result.current.dangerouslyCastedData).toEqual({
      isLive: false,
      isSandboxRestricted: false,
      logoUrl: null,
      name: 'Acme',
    });
  });

  it('should indicate is sandbox when is not in live mode', () => {
    const { result } = customRenderHook(() => useOrgSession());

    expect(result.current.sandbox.isSandbox).toBeTruthy();
  });

  it('should toggle sandbox mode', async () => {
    const { result } = customRenderHook(() => useOrgSession());
    expect(result.current.sandbox.isSandbox).toBeTruthy();
    act(() => {
      result.current.sandbox.toggle();
    });

    expect(result.current.sandbox.isSandbox).toBeFalsy();
  });

  it('should update', () => {
    const { result } = customRenderHook(() => useOrgSession());
    expect(result.current.dangerouslyCastedData).toEqual({
      isLive: false,
      isSandboxRestricted: false,
      logoUrl: null,
      name: 'Acme',
    });

    act(() => {
      result.current.sandbox.update({ name: 'Lorem' });
    });
    expect(result.current.dangerouslyCastedData).toEqual({
      isLive: false,
      isSandboxRestricted: false,
      logoUrl: null,
      name: 'Lorem',
    });
  });
});
