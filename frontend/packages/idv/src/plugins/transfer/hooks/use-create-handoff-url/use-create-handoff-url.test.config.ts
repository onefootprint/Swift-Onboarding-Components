import type { PublicOnboardingConfig } from '@onefootprint/types';
import {
  DocumentRequestKind,
  OnboardingConfigStatus,
  OnboardingRequirementKind,
} from '@onefootprint/types';

import type { TransferRequirements } from '../../types';

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
  documents: [
    {
      kind: OnboardingRequirementKind.idDoc,
      isMet: false,
      documentRequestId: '1',
      uploadMode: 'default',
      config: {
        kind: DocumentRequestKind.Identity,
        shouldCollectSelfie: false,
        shouldCollectConsent: false,
        supportedCountryAndDocTypes: {},
      },
    },
  ],
};

export const missingRequirementsNonAvailableFixture: TransferRequirements = {
  documents: [
    {
      kind: OnboardingRequirementKind.idDoc,
      isMet: false,
      documentRequestId: '1',
      uploadMode: 'default',
      config: {
        kind: DocumentRequestKind.ProofOfSsn,
      },
    },
  ],
};
