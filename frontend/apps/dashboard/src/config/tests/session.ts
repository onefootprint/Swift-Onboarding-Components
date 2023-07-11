import { RoleScope, RoleScopeKind } from '@onefootprint/types';
import { useStore } from 'src/hooks/use-session';

const originalState = useStore.getState();

const baseUser = {
  id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
  email: 'jane.doe@acme.com',
  firstName: 'Jane',
  lastName: 'Doe',
  scopes: [{ kind: RoleScopeKind.admin } as RoleScope],
  isAssumedSession: false,
};

const baseOrg = {
  name: 'Acme',
  logoUrl: null,
  isSandboxRestricted: false,
  isLive: false,
};

const baseMeta = {
  createdNewTenant: false,
  isFirstLogin: false,
  requiresOnboarding: false,
  isAssumed: false,
};

export const asUser = (user?: Partial<typeof baseUser>) => {
  useStore.setState({
    data: {
      auth: '1',
      user: {
        ...baseUser,
        ...user,
      },
      org: baseOrg,
      meta: baseMeta,
    },
  });
};

export const resetUser = () => {
  useStore.setState(originalState);
};

export const asAdminUser = () => {
  useStore.setState({
    data: {
      auth: '1',
      user: baseUser,
      org: baseOrg,
      meta: baseMeta,
    },
  });
};

export const asAdminUserFirmEmployee = () => {
  useStore.setState({
    data: {
      auth: '1',
      user: {
        ...baseUser,
        isFirmEmployee: true,
      },
      org: baseOrg,
      meta: baseMeta,
    },
  });
};

export const asAdminUserInSandbox = () => {
  useStore.setState({
    data: {
      auth: '1',
      user: baseUser,
      org: {
        ...baseOrg,
        isLive: false,
      },
      meta: baseMeta,
    },
  });
};

export const asAdminUserInSandboxAndRestricted = () => {
  useStore.setState({
    data: {
      auth: '1',
      user: baseUser,
      org: {
        ...baseOrg,
        isSandboxRestricted: true,
        isLive: false,
      },
      meta: baseMeta,
    },
  });
};

export const asAdminUserInLive = () => {
  useStore.setState({
    data: {
      auth: '1',
      user: baseUser,
      org: {
        ...baseOrg,
        isLive: true,
      },
      meta: baseMeta,
    },
  });
};

export const asUserWithScope = (
  scopeKinds: Exclude<RoleScopeKind, RoleScopeKind.decrypt>[],
) => {
  useStore.setState({
    data: {
      auth: '1',
      user: {
        ...baseUser,
        scopes: scopeKinds.map(s => ({ kind: s })),
      },
      org: baseOrg,
      meta: baseMeta,
    },
  });
};

export const asAssumedUser = () => {
  useStore.setState({
    data: {
      auth: '1',
      user: {
        ...baseUser,
        isAssumedSession: true,
      },
      org: baseOrg,
      meta: baseMeta,
    },
  });
};
