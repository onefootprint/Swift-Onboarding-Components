import type { BasicRoleScopeKind } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import type { OrgSession, UserSession } from 'src/hooks/use-session';
import { useStore } from 'src/hooks/use-session';

const originalState = useStore.getState();

const baseUser: UserSession = {
  id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
  email: 'jane.doe@acme.com',
  firstName: 'Jane',
  lastName: 'Doe',
  scopes: [{ kind: RoleScopeKind.admin }],
  isAssumedSession: false,
};

const baseOrg: OrgSession = {
  id: 'org_hyZP3ksCvsT0AlLqMZsgrI',
  name: 'Acme',
  isLive: false,
  isProdAuthPlaybookRestricted: false,
  isProdKybPlaybookRestricted: false,
  isProdKycPlaybookRestricted: false,
  isProdNeuroEnabled: false,
  isProdSentilinkEnabled: false,
  isSandboxRestricted: false,
  logoUrl: null,
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

export const asAdminUserWithOrg = (orgArgs: Partial<OrgSession>) => {
  useStore.setState({
    data: {
      auth: '1',
      user: baseUser,
      org: {
        ...baseOrg,
        ...orgArgs,
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

export const asAdminUserInOrg = (orgName: string) => {
  useStore.setState({
    data: {
      auth: '1',
      user: baseUser,
      org: {
        ...baseOrg,
        name: orgName,
        isLive: true,
      },
      meta: baseMeta,
    },
  });
};

export const asUserWithScope = (scopeKinds: BasicRoleScopeKind[]) => {
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

export const asAdminUserRestrictedToSandbox = () =>
  asAdminUserWithOrg({
    id: 'org_UT091oogB4RJv1QbBesp2h',
    name: 'Retro Bank',
    isSandboxRestricted: true,
    isLive: false,
    isProdKybPlaybookRestricted: true,
    isProdAuthPlaybookRestricted: true,
    isProdKycPlaybookRestricted: true,
  });
