import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';
import { BIFROST_AUTH_HEADER } from 'src/config/constants';
import generateRegisterDeviceResponse from 'src/utils/biometric/register-challenge-response';
import { BiometricRegisterRequest, BiometricRegisterResponse } from 'types';

const biometricRegister = async (payload: BiometricRegisterRequest) => {
  const { authToken } = payload;
  const initResponse = await request<{
    challengeToken: string;
    challengeJson: string;
  }>({
    method: 'POST',
    url: '/hosted/user/biometric/init',
    data: payload,
    headers: {
      [BIFROST_AUTH_HEADER]: authToken,
    },
  });

  const deviceResponseJson = await generateRegisterDeviceResponse(
    initResponse.data.challengeJson,
  );
  const { challengeToken } = initResponse.data;

  const response = await request<BiometricRegisterResponse>({
    method: 'POST',
    url: '/hosted/user/biometric',
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
