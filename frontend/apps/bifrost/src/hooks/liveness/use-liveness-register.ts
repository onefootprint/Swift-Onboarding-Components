import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

import {
  generateDeviceResponse,
  parseChallenge,
} from './utils/challenge-response-utils';

export type LivenessRegisterRequest = {
  authToken: string;
};

export type LivenessRegisterResponse = {
  data: string;
};

const livenessRegister = async (payload: LivenessRegisterRequest) => {
  const { authToken } = payload;
  const { data: initResponse } = await request<
    RequestResponse<{
      challengeToken: string;
      challengeJson: string;
    }>
  >({
    method: 'POST',
    url: '/liveness/register/init',
    data: payload,
    headers: {
      'X-Fpuser-Authorization': authToken,
    },
  });

  const publicKeyCredential = await parseChallenge(
    initResponse.data.challengeJson,
  );
  const { challengeToken } = initResponse.data;
  const deviceResponseJson = generateDeviceResponse(publicKeyCredential);

  const { data: response } = await request<
    RequestResponse<LivenessRegisterResponse>
  >({
    method: 'POST',
    url: '/liveness/register',
    data: {
      deviceResponseJson,
      challengeToken,
    },
    headers: {
      'X-Fpuser-Authorization': authToken,
    },
  });
  return response.data;
};

const useLivenessRegister = () =>
  useMutation<LivenessRegisterResponse, RequestError, LivenessRegisterRequest>(
    livenessRegister,
  );

export default useLivenessRegister;
