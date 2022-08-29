import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import { MY1FP_AUTH_HEADER } from 'src/config/constants';

export type D2PGenerateRequest = {
  authToken: string;
};

export type D2PGenerateResponse = {
  // Scoped auth token that will be:
  // 1) used to pass state between the desktop and phone AND
  // 2) used on the phone as the authentication that allows the phone to register a new webauthn credential
  authToken: string;
};

const d2pGenerate = async (payload: D2PGenerateRequest) => {
  const response = await request<D2PGenerateResponse>({
    method: 'POST',
    url: '/hosted/onboarding/d2p/generate',
    data: payload,
    headers: {
      [MY1FP_AUTH_HEADER]: payload.authToken,
    },
  });
  return response.data;
};

const useD2PGenerate = () =>
  useMutation<D2PGenerateResponse, RequestError, D2PGenerateRequest>(
    d2pGenerate,
  );

export default useD2PGenerate;
