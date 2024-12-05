import { fpRequest } from '../config/request';

export const process = async authToken => {
  const response = await fpRequest({
    method: 'POST',
    url: '/hosted/onboarding/process',
    headers: {
      'X-Fp-Authorization': authToken,
    },
  });

  return response;
};
