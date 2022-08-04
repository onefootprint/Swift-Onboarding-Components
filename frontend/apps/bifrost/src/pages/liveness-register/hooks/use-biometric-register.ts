import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';
import { BIFROST_AUTH_HEADER } from 'src/config/constants';
import generateRegisterDeviceResponse from 'src/utils/biometric/register-challenge-response';

export type BiometricRegisterRequest = {
  authToken: string;
};

export type BiometricRegisterResponse = {
  data: string;
};

const biometricRegister = async (payload: BiometricRegisterRequest) => {
  const { authToken } = payload;
  const { data: initResponse } = await request<
    RequestResponse<{
      challengeToken: string;
      challengeJson: string;
    }>
  >({
    method: 'POST',
    url: '/internal/user/biometric/init',
    data: payload,
    headers: {
      [BIFROST_AUTH_HEADER]: authToken,
    },
  });

  const deviceResponseJson = await generateRegisterDeviceResponse(
    initResponse.data.challengeJson,
  );
  const { challengeToken } = initResponse.data;

  const { data: response } = await request<
    RequestResponse<BiometricRegisterResponse>
  >({
    method: 'POST',
    url: '/internal/user/biometric',
    data: {
      deviceResponseJson,
      challengeToken,
    },
    headers: {
      [BIFROST_AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useBiometricRegister = () =>
  useMutation<
    BiometricRegisterResponse,
    RequestError,
    BiometricRegisterRequest
  >(biometricRegister);

export default useBiometricRegister;
