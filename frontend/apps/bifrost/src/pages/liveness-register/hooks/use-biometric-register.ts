import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
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
    url: '/user/biometric/init',
    data: payload,
    headers: {
      'X-Fpuser-Authorization': authToken,
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

const useBiometricRegister = () =>
  useMutation<
    BiometricRegisterResponse,
    RequestError,
    BiometricRegisterRequest
  >(biometricRegister);

export default useBiometricRegister;
