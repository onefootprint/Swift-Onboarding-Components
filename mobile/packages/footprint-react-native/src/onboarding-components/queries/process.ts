import request from 'src/utils/request';

const process = async (options: { token: string }): Promise<{}> => {
  const response = await request<{}>({
    method: 'POST',
    url: '/hosted/onboarding/process',
    headers: {
      'X-Fp-Authorization': options.token,
    },
  });

  return response;
};

export default process;
