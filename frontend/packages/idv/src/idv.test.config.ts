import { mockRequest } from '@onefootprint/test-utils';
import {
  ChallengeKind,
  CollectedKycDataOption,
  OnboardingRequirement,
  OnboardingRequirementKind,
  UserTokenScope,
} from '@onefootprint/types';

export const onboardingConfigFixture = {
  id: 'ob_config_id_18RIzpIPRAL3pYlnO4Cgeb',
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  name: 'Acme Bank',
  org_name: 'Acme Bank',
  logo_url: null,
  must_collect_data: [
    CollectedKycDataOption.name,
    CollectedKycDataOption.dob,
    CollectedKycDataOption.email,
    CollectedKycDataOption.partialAddress,
    CollectedKycDataOption.ssn9,
  ],
  can_access_data: ['dob'],
  is_live: true,
  created_at: '2022-07-20T01:52:36.984290Z',
  status: 'enabled',
};

export const sandboxOnboardingConfigFixture = {
  id: 'ob_config_id_18RIzpIPRAL3pYlnO4Cgeb',
  key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
  name: 'Acme Bank',
  org_name: 'Acme Bank',
  logo_url: null,
  must_collect_data: [
    CollectedKycDataOption.name,
    CollectedKycDataOption.dob,
    CollectedKycDataOption.email,
    CollectedKycDataOption.partialAddress,
    CollectedKycDataOption.ssn9,
  ],
  can_access_data: ['dob'],
  is_live: false,
  created_at: '2022-07-20T01:52:36.984290Z',
  status: 'enabled',
};

export const withOnboardingConfig = (data = onboardingConfigFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_config',
    response: data,
  });

export const withOnboarding = (onboardingConfig = onboardingConfigFixture) =>
  mockRequest({
    method: 'post',
    path: '/hosted/onboarding',
    response: {
      onboardingConfig,
    },
  });

const RequirementsFixture: OnboardingRequirement[] = [
  {
    kind: OnboardingRequirementKind.collectKycData,
    missingAttributes: [
      CollectedKycDataOption.name,
      CollectedKycDataOption.dob,
    ],
    populatedAttributes: [],
  },
];

const MetRequirementsFixture: OnboardingRequirement[] = [];

export const withRequirements = (
  requirements = RequirementsFixture,
  metRequirements = MetRequirementsFixture,
) => {
  mockRequest({
    method: 'get',
    path: '/hosted/onboarding/status',
    response: {
      requirements,
      metRequirements,
      obConfiguration: onboardingConfigFixture,
    },
  });
};

export const withUserToken = () =>
  mockRequest({
    method: 'get',
    path: '/hosted/user/token',
    response: {
      scopes: [UserTokenScope.sensitiveProfile],
    },
  });

export const withIdentify = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify',
    response: {
      userFound: true,
      availableChallengeKinds: [ChallengeKind.biometric],
      hasSyncablePassKey: true,
    },
  });
