import { HOSTED_BASE_URL } from '@onefootprint/global-constants';
import { HostedUrlType, OnboardingConfig } from '@onefootprint/types';

const getPermanentLink = (onboardingConfig: OnboardingConfig) =>
  `${HOSTED_BASE_URL}/?type=${HostedUrlType.onboardingConfigPublicKey}#${onboardingConfig.key}`;

export default getPermanentLink;
