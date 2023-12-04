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
      id: '"org_hyZP3ksCvsT0AlLqMZsgrI"',
      isLive: false,
      isSandboxRestricted: false,
      logoUrl: null,
      name: 'Acme',
      isProdKybPlaybookRestricted: false,
      isProdKycPlaybookRestricted: false,
      isProdAuthPlaybookRestricted: false,
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
});
