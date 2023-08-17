import {
  CollectedKycDataOption,
  OnboardingConfigStatus,
} from '@onefootprint/types';

const getOnboardingConfig = () => ({
  id: 'ob_config_id_18RIzpIPRAL3pYlnO4Cgeb',
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  name: 'Acme Bank',
  orgName: 'Acme Bank',
  logoUrl: null,
  mustCollectData: [CollectedKycDataOption.ssn9],
  canAccessData: [CollectedKycDataOption.ssn9],
  isLive: true,
  createdAt: '2022-07-20T01:52:36.984290Z',
  status: OnboardingConfigStatus.enabled,
  isAppClipEnabled: false,
  privacyPolicyUrl: null,
});

export default getOnboardingConfig;
