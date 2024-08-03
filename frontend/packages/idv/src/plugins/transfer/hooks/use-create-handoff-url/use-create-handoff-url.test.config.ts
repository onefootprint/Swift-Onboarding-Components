import type { PublicOnboardingConfig } from '@onefootprint/types';
import { DocumentRequestKind, OnboardingConfigStatus, OnboardingRequirementKind } from '@onefootprint/types';

import type { TransferRequirements } from '../../types';
import { idDocReq } from '../../utils/state-machine/machine.test';

export const onboardingConfigFixture: PublicOnboardingConfig = {
  allowInternationalResidents: false,
  appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
  isAppClipEnabled: false,
  isInstantAppEnabled: false,
  isLive: true,
  isNoPhoneFlow: false,
  key: 'key',
  logoUrl: 'url',
  name: 'tenant',
  orgName: 'tenantOrg',
  orgId: 'orgId',
  privacyPolicyUrl: 'url',
  status: OnboardingConfigStatus.enabled,
  requiresIdDoc: false,
  isKyb: false,
};

export const missingRequirementsFixture: TransferRequirements = {
  documents: [idDocReq],
};

export const missingRequirementsNonAvailableFixture: TransferRequirements = {
  documents: [
    idDocReq,
    {
      kind: OnboardingRequirementKind.document,
      isMet: false,
      documentRequestId: '1',
      uploadMode: 'default',
      config: {
        kind: DocumentRequestKind.ProofOfSsn,
      },
    },
  ],
};
