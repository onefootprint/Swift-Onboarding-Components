import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

import {
  createPublicKeyCredential,
  generateDeviceResponse,
} from '../../utils/biometric/challenge-response';

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
    url: '/user/biometric/init',
    data: payload,
    headers: {
      'X-Fpuser-Authorization': authToken,
    },
  });

  const publicKeyCredential = await createPublicKeyCredential(
    initResponse.data.challengeJson,
  );
  const { challengeToken } = initResponse.data;
  const deviceResponseJson = generateDeviceResponse(publicKeyCredential);

  const { data: response } = await request<
    RequestResponse<LivenessRegisterResponse>
  >({
    method: 'POST',
    url: '/user/biometric',
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
