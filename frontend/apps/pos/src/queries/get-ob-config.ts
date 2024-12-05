import request from '../config/request';

const getOnboardingConfig = async obConfig => {
  const response = await request({
    method: 'GET',
    url: '/hosted/onboarding/config',
    headers: {
      'X-Onboarding-Config-Key': obConfig,
    },
  });

  return response;
};

export default getOnboardingConfig;
