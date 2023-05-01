import request from '@onefootprint/request';
import {
  BiometricRegisterChallengeJson,
  BiometricRegisterRequest,
  // BiometricRegisterResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { Buffer } from 'buffer';
import { Passkey } from 'react-native-passkey';

import AUTH_HEADER from '@/config/constants';

function toBase64(input) {
  return Buffer.from(input).toString('base64');
}

const passkey = new Passkey('handoff.preview.onefootprint.com', 'Footprint');

const generateDeviceResponse = async (challenge: string) => {
  const challengeJson = JSON.parse(challenge) as BiometricRegisterChallengeJson;
  const { publicKey } = challengeJson;
  console.log('0', publicKey);
  const result = await passkey.register(
    toBase64(publicKey.challenge),
    toBase64(publicKey.user.id),
  );
  console.log('1', result);
  const response = {
    rawId: toBase64(result.credentialID),
    id: result.credentialID,
    type: 'public-key',
    response: {
      clientDataJSON: result.response.rawClientDataJSON,
      attestationObject: result.response.rawAttestationObject,
    },
  };
  return response;
};

const biometricInit = async (payload: BiometricRegisterRequest) => {
  const { authToken } = payload;
  const initResponse = await request<{
    challengeToken: string;
    challengeJson: string;
  }>({
    method: 'POST',
    url: '/hosted/user/biometric/init',
    data: payload,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  const { challengeToken, challengeJson } = initResponse.data;
  const deviceResponseJson = await generateDeviceResponse(challengeJson);
  console.log('challengeToken', challengeToken);
  return deviceResponseJson;
  // console.log('2', deviceResponseJson);
  // const response = await request<BiometricRegisterResponse>({
  //   method: 'POST',
  //   url: '/hosted/user/biometric',
  //   data: {
  //     deviceResponseJson,
  //     challengeToken,
  //   },
  //   headers: {
  //     [AUTH_HEADER]: authToken,
  //   },
  // });
  // console.log('3', response.data);
  // return response.data;
};

const useBiometricInit = () => useMutation(biometricInit);

export default useBiometricInit;
