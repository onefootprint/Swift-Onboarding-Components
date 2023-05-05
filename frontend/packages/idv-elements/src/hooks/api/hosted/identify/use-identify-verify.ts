import request from '@onefootprint/request';
import {
  IdentifyVerifyRequest,
  IdentifyVerifyResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';

const identifyVerifyRequest = async (payload: IdentifyVerifyRequest) => {
  const { obConfigAuth, challengeResponse, challengeToken } = payload;
  const response = await request<IdentifyVerifyResponse>({
    method: 'POST',
    url: '/hosted/identify/verify',
    data: {
      challengeResponse,
      challengeToken,
    },
    headers: obConfigAuth,
  });

  return response.data;
};

const useIdentifyVerify = () => useMutation(identifyVerifyRequest);

export default useIdentifyVerify;
