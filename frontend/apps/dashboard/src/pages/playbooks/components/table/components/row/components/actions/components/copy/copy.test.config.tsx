import { mockRequest } from '@onefootprint/test-utils';
import type { OnboardingConfig } from '@onefootprint/types';
import {
  CollectedKycDataOption,
  OnboardingConfigStatus,
} from '@onefootprint/types';
import { OnboardingConfigKind } from '@onefootprint/types/src/data/onboarding-config';
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
  enhancedAml: {
    enhancedAml: false,
    ofac: false,
    pep: false,
    adverseMedia: false,
  },
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
};

export const withPlaybookCopyError = (playbook = playbookFixture) =>
  mockRequest({
    method: 'post',
    path: `/org/onboarding_configs/${playbook.id}/copy`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
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
    },
  });

export const CopyWithButton = ({
  playbook = playbookFixture,
}: Partial<CopyProps>) => {
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
