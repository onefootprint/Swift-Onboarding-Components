import { HOSTED_BASE_URL } from '@onefootprint/global-constants';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { HostedUrlType } from '@onefootprint/types';

const getPermanentLink = (playbook: OnboardingConfiguration) => {
  return `${HOSTED_BASE_URL}/?type=${HostedUrlType.onboardingConfigPublicKey}#${playbook.key}`;
};

export default getPermanentLink;
