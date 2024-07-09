import { act, customRenderHook, mockRequest } from '@onefootprint/test-utils';
import { RoleScopeKind } from '@onefootprint/types';
import { asAdminUserInSandbox, resetUser } from 'src/config/tests';

import useOrgSession from './use-org-session';

const getOrgMemberResponse = {
  id: 'orguser_LHX6Nbt32W2gbDrXacVyU',
  email: 'hi@onefootprint.com',
  firstName: 'Piip',
  lastName: 'Penguin',
  isAssumedSession: false,
  scopes: [{ kind: RoleScopeKind.admin }],
  tenant: {
    name: 'Acme',
    logoUrl: null,
    isSandboxRestricted: false,
  },
};

describe('useOrgSession', () => {
  beforeEach(() => {
    asAdminUserInSandbox();
    mockRequest({
      method: 'get',
      path: '/org/member',
      response: getOrgMemberResponse,
    });
  });

  afterAll(() => {
    resetUser();
  });

  it('should return the data', () => {
    const { result } = customRenderHook(() => useOrgSession());

    expect(result.current.dangerouslyCastedData).toEqual({
      id: 'org_hyZP3ksCvsT0AlLqMZsgrI',
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
    await act(async () => {
      await result.current.sandbox.toggle();
    });

    expect(result.current.sandbox.isSandbox).toBeFalsy();
  });
});
