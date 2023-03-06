import { RoleScope } from '@onefootprint/types';
import { useStore } from 'src/hooks/use-session';

const originalState = useStore.getState();

const baseUser = {
  id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
  email: 'jane.doe@acme.com',
  firstName: 'Jane',
  lastName: 'Doe',
  role: {
    createdAt: '2022-09-19T16:24:34.368337Z',
    id: 'Role_aExxJ6XgSBpvqIJ2VcHH6J',
    isImmutable: true,
    name: 'Admin',
    numActiveUsers: 1,
    scopes: [RoleScope.admin],
  },
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
        isLive: false,
        isSandboxRestricted: true,
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

export const asMemberUser = () => {
  useStore.setState({
    data: {
      auth: '1',
      user: {
        ...baseUser,
        role: {
          ...baseUser.role,
          scopes: ['member' as RoleScope],
        },
      },
      org: baseOrg,
      meta: baseMeta,
    },
  });
};

export const asUserWithScope = (scopes: RoleScope[]) => {
  useStore.setState({
    data: {
      auth: '1',
      user: {
        ...baseUser,
        role: {
          ...baseUser.role,
          scopes,
        },
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
      user: baseUser,
      org: baseOrg,
      meta: {
        ...baseMeta,
        isAssumed: true,
      },
    },
  });
};
