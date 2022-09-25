import {
  BiometricRegisterRequest,
  BiometricRegisterResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';

import { BIFROST_AUTH_HEADER } from '../config/constants';
import generateRegisterDeviceResponse from '../utils/biometric/register-challenge-response';

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
