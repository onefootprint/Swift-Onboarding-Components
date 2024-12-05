import { fpRequest } from '../config/request';

export const vault = async (data, authToken) => {
  const response = await fpRequest({
    method: 'PATCH',
    url: '/hosted/user/vault',
    data,
    headers: {
      'X-Fp-Authorization': authToken,
    },
  });

  return response;
};
