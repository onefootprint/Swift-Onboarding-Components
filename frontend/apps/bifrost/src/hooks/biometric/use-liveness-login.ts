import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

import {
  generateDeviceResponse,
  getPublicKeyCredential,
} from './utils/challenge-response-utils';

export type LivenessLoginRequest = {
  email: string;
};

export type LivenessLoginResponse = {
  authToken: string;
};

const livenessLogin = async (payload: LivenessLoginRequest) => {
  const { data: initResponse } = await request<
    RequestResponse<{
      challengeToken: string;
      challengeJson: string;
    }>
  >({
    method: 'POST',
    url: '/liveness/login/init',
    data: payload,
  });

  const publicKeyCredential = await getPublicKeyCredential(
    initResponse.data.challengeJson,
  );
  const { challengeToken } = initResponse.data;
  const deviceResponseJson = generateDeviceResponse(publicKeyCredential);

  const { data: response } = await request<
    RequestResponse<LivenessLoginResponse>
  >({
    method: 'POST',
    url: '/liveness/login',
    data: {
      deviceResponseJson,
      challengeToken,
    },
  });
  return response.data;
};

const useLivenessLogin = () =>
  useMutation<LivenessLoginResponse, RequestError, LivenessLoginRequest>(
    livenessLogin,
  );

export default useLivenessLogin;
