import request from 'src/utils/request';

type ValidateOnboardingResponse = {
  validationToken: string;
};

const validateOnboarding = async (options: { authToken: string }): Promise<ValidateOnboardingResponse> => {
  const response = await request<ValidateOnboardingResponse>({
    method: 'POST',
    url: '/hosted/onboarding/validate',
    headers: {
      'X-Fp-Authorization': options.authToken,
    },
  });

  return response;
};

export default validateOnboarding;
