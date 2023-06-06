import request from '@onefootprint/request';
import {
  BiometricRegisterChallengeJson,
  BiometricRegisterResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import base64url from 'base64url';
import { Passkey } from 'react-native-passkey';

import AUTH_HEADER from '@/config/constants';

const passkey = new Passkey('onefootprint.com', 'Footprint');

const biometricInit = async (authToken: string) => {
  const { data } = await request<{
    challengeToken: string;
    challengeJson: string;
  }>({
    method: 'POST',
    url: '/hosted/user/biometric/init',
    data: authToken,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return data;
};

const generateDeviceResponse = async (challenge: string) => {
  const challengeJson = JSON.parse(challenge) as BiometricRegisterChallengeJson;
  const { publicKey } = challengeJson;
  const result = await passkey.register(
    base64url.toBase64(publicKey.challenge as unknown as string),
    base64url.toBase64(publicKey.user.id as unknown as string),
  );
  const response = {
    rawId: base64url.toBase64(result.credentialID),
    id: result.credentialID,
    type: 'public-key',
    response: {
      clientDataJSON: result.response.rawClientDataJSON,
      attestationObject: result.response.rawAttestationObject,
    },
  };
  return JSON.stringify(response);
};

const register = async ({ authToken, deviceResponseJson, challengeToken }) => {
  const response = await request<BiometricRegisterResponse>({
    method: 'POST',
    url: '/hosted/user/biometric',
    data: {
      deviceResponseJson,
      challengeToken,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response;
};

const registerBiometric = async (authToken: string) => {
  const { challengeToken, challengeJson } = await biometricInit(authToken);
  const deviceResponseJson = await generateDeviceResponse(challengeJson);
  const response = await register({
    authToken,
    challengeToken,
    deviceResponseJson,
  });
  return response;
};

const useBiometricInit = () => useMutation(registerBiometric);

export default useBiometricInit;
