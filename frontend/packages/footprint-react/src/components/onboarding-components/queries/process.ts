import request from '../utils/request';

type ProcessResponse = {
  allRequirements: Array<{
    isMet: boolean;
    kind: string;
    // @ts-ignore
    [key: string]: unknown;
  }>;
  ob_configuration: {
    [key: string]: unknown;
  };
};

const process = async (options: { token: string }): Promise<ProcessResponse> => {
  const response = await request<ProcessResponse>({
    method: 'POST',
    url: '/hosted/onboarding/process',
    headers: {
      'X-Fp-Authorization': options.token,
    },
  });

  return response;
};

export default process;
