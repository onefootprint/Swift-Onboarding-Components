import { HOSTED_BASE_URL } from '@onefootprint/global-constants';
import type { OnboardingConfig } from '@onefootprint/types';
import { HostedUrlType } from '@onefootprint/types';

const getPermanentLink = (playbook: OnboardingConfig) =>
  `${HOSTED_BASE_URL}/?type=${HostedUrlType.onboardingConfigPublicKey}#${playbook.key}`;

export default getPermanentLink;
