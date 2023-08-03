import { mockRequest } from '@onefootprint/test-utils';

export const onboardingConfigsFixture = [
  {
    id: 'ob_config_id_18RIzpIPRAL3pYlnO4Cgeb',
    key: 'ob_config_pk_9VSl6Z7Ax9IQRIFkihw4lm',
    name: 'Acme Bank',
    org_name: 'Acme Bank',
    logo_url: null,
    must_collect_data: ['name', 'dob', 'document'],
    can_access_data: ['dob', 'document'],
    is_live: true,
    created_at: '2022-07-20T01:52:36.984290Z',
    status: 'enabled',
  },
  {
    id: 'ob_config_id_1e23r3g32RAL3wfkewnfgerg',
    key: 'ob_config_pk_referlkgerRIFkihw4lm',
    name: 'Footprint Live',
    org_name: 'Footprint Live',
    logo_url: null,
    must_collect_data: ['name', 'dob', 'ssn4', 'business_name'],
    can_access_data: ['dob', 'ssn4'],
    is_live: true,
    created_at: '2022-08-20T01:52:36.984290Z',
    status: 'disabled',
  },
];

export const withOnboardingConfigs = (data = onboardingConfigsFixture) =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_configs',
    delay: 50,
    response: {
      data,
      meta: {
        count: data.length,
        next_page: null,
      },
    },
  });

export const withEntities = () =>
  mockRequest({
    method: 'get',
    path: '/entities',
    response: {
      data: [],
      meta: {},
    },
  });

export const withOnboardingConfigsError = () =>
  mockRequest({
    method: 'get',
    path: '/org/onboarding_configs',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });

export const withUpdateOnboardingConfigs = (options: {
  prevData: Record<string, any>;
  nextData: Record<string, any>;
}) =>
  mockRequest({
    method: 'patch',
    path: `/org/onboarding_configs/${options.prevData.id}`,
    response: {
      ...options.prevData,
      ...options.nextData,
    },
  });

export const withUpdateOnboardingConfigsError = (data: any) =>
  mockRequest({
    delay: 150,
    method: 'patch',
    path: `/org/onboarding_configs/${data.id}`,
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
