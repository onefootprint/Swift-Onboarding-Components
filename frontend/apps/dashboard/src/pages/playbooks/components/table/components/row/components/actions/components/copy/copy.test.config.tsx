import { mockRequest } from '@onefootprint/test-utils';
import {
  AuthMethodKind,
  CollectedKycDataOption,
  type GetAuthRoleResponse,
  type OnboardingConfig,
  OnboardingConfigKind,
  OnboardingConfigStatus,
  type OrgAssumeRoleResponse,
  RoleKind,
  RoleScopeKind,
} from '@onefootprint/types';
import React from 'react';

import Copy, { type CopyHandler, type CopyProps } from './copy';

export const playbookFixture: OnboardingConfig = {
  author: {
    kind: 'organization',
    member: 'Jane doe',
  },
  allowInternationalResidents: false,
  allowUsResidents: true,
  allowUsTerritoryResidents: false,
  appearance: undefined,
  canAccessData: [],
  createdAt: '',
  id: 'ob_config_id_7TU1EGLHwjoioStPuRyWpm',
  internationalCountryRestrictions: null,
  isDocFirstFlow: false,
  isLive: false,
  isNoPhoneFlow: false,
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  kind: OnboardingConfigKind.kyc,
  mustCollectData: [CollectedKycDataOption.name],
  name: 'People verification',
  optionalData: [],
  skipKyc: false,
  status: OnboardingConfigStatus.enabled,
  ruleSet: {
    version: 1,
  },
  documentsToCollect: null,
  promptForPasskey: true,
  allowReonboard: false,
  businessDocumentsToCollect: [],
  requiredAuthMethods: [AuthMethodKind.phone],
  verificationChecks: [],
};

export const authRolesFixture: GetAuthRoleResponse = [
  {
    id: 'org_e2FHVfOM5Hd3Ce492o5Aat',
    name: 'Footprint Live',
    allowDomainAccess: true,
    allowedPreviewApis: [],
    companySize: null,
    domains: ['onefootprint.com'],
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: false,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: 'https://i.onefp.net/ol/thFVfsCGMpAx0my0NpP2C8VvR8EZmIO9OUOZdFfnvRQ/cRF5Xhzq6fvXiYRz5vUSk8.png',
    parent: null,
    supportEmail: null,
    supportPhone: null,
    supportWebsite: null,
    websiteUrl: 'https://live.onefootprint.com',
  },
  {
    id: 'org_hyZP3ksCvsT0AlLqMZsgrI',
    name: 'Acme Inc.',
    allowDomainAccess: true,
    allowedPreviewApis: [],
    companySize: null,
    domains: ['footprint.dev'],
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: false,
    isProdKybPlaybookRestricted: false,
    isProdKycPlaybookRestricted: false,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: false,
    logoUrl: 'https://i.onefp.net/ol/lwjLynvXuFnhXT6iIMZR8NagJaK258Yb1cpLuEcq9L0/mETX8r3MFwBH8DPiRk3GKE.png',
    parent: null,
    supportEmail: 'acme@onefootprint.com',
    supportPhone: '+155555550100',
    supportWebsite: 'https://demo.onefootprint.com/acme',
    websiteUrl: 'https://acme.com',
  },
  {
    id: 'org_UT091oogB4RJv1QbBesp2h',
    name: 'Retro Bank',
    allowDomainAccess: false,
    allowedPreviewApis: [],
    companySize: null,
    domains: [],
    isAuthMethodSupported: true,
    isDomainAlreadyClaimed: false,
    isProdKybPlaybookRestricted: true,
    isProdKycPlaybookRestricted: true,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: true,
    logoUrl: 'https://i.onefp.net/ol/m9IjQQ7_cqcDSOmnFJYs98pFGxYv81xjILx-mOpuzLk/Wn4KS4sJpxmpLUmL2usPBl.png',
    parent: null,
    supportEmail: null,
    supportPhone: null,
    supportWebsite: null,
    websiteUrl: 'https://retro-bank.com',
  },
];

export const orgAssumeRoleFixture: OrgAssumeRoleResponse = {
  token: 'dbtok_AiOqOM04E6wX3jM2Dd97IbSMbfpqdKoT8o',
  user: {
    id: 'orguser_k0yUYuO2fFCwMHFPShuK77',
    email: 'jane@onefootprint.com',
    firstName: 'Jane',
    lastName: 'Doe',
    role: {
      id: 'orgrole_VFgjE8N8C4iG3GqlkBFoj',
      name: 'Admin',
      scopes: [
        {
          kind: RoleScopeKind.admin,
        },
      ],
      isImmutable: true,
      createdAt: '2023-08-04T18:06:06.919345Z',
      kind: RoleKind.dashboardUser,
      numActiveUsers: 0,
      numActiveApiKeys: 0,
    },
    rolebinding: {
      lastLoginAt: '2024-05-08T13:25:04.283787Z',
    },
  },
  tenant: {
    id: 'org_UT091oogB4RJv1QbBesp2h',
    name: 'Retro Bank',
    allowDomainAccess: false,
    allowedPreviewApis: [],
    companySize: null,
    domains: [],
    isDomainAlreadyClaimed: false,
    isProdKybPlaybookRestricted: true,
    isProdKycPlaybookRestricted: true,
    isProdAuthPlaybookRestricted: false,
    isProdNeuroEnabled: false,
    isProdSentilinkEnabled: false,
    isSandboxRestricted: true,
    logoUrl: 'https://i.onefp.net/ol/m9IjQQ7_cqcDSOmnFJYs98pFGxYv81xjILx-mOpuzLk/Wn4KS4sJpxmpLUmL2usPBl.png',
    parent: null,
    supportEmail: null,
    supportPhone: null,
    supportWebsite: null,
    websiteUrl: 'https://retro-bank.com',
  },
};

export const withAssumeRole = () => {
  mockRequest({
    method: 'post',
    path: '/org/auth/assume_role',
    response: orgAssumeRoleFixture,
  });
};

export const withPlaybookCopyError = (playbook = playbookFixture) =>
  mockRequest({
    method: 'post',
    path: `/org/onboarding_configs/${playbook.id}/copy`,
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });

export const withPlaybookCopy = (playbook = playbookFixture) =>
  mockRequest({
    method: 'post',
    path: `/org/onboarding_configs/${playbook.id}/copy`,
    response: {
      ...playbookFixture,
      id: 'ob_config_id_7TU1EGLHwjoioStPuRyWpm_copy',
      name: `${playbook.name} (copy)`,
      isLive: true,
    },
  });

export const withModes = () => {
  mockRequest({
    method: 'get',
    path: '/org/member',
    response: {
      data: [],
      meta: {
        next: null,
        count: null,
      },
    },
  });
  mockRequest({
    method: 'post',
    path: '/org/auth/logout',
    response: {},
  });
};

export const withAuthRoles = (response: GetAuthRoleResponse = authRolesFixture) => {
  mockRequest({
    method: 'get',
    path: '/org/auth/roles',
    response,
  });
};

export const CopyWithButton = ({ playbook = playbookFixture }: Partial<CopyProps>) => {
  const ref = React.useRef<CopyHandler>(null);

  return (
    <>
      <button onClick={() => ref.current?.launch()} type="button">
        Open
      </button>
      <Copy ref={ref} playbook={playbook} />
    </>
  );
};

export default playbookFixture;
