import request from '@onefootprint/request';
import type {
  BiometricRegisterChallengeJson,
  BiometricRegisterResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import base64url from 'base64url';
import { Passkey } from 'react-native-passkey';

import { AUTH_HEADER } from '@/config/constants';

type RegisterResponse = {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
  };
};

const biometricInit = async (authToken: string) => {
  const { data } = await request<{
    challengeToken: string;
    challengeJson: string;
  }>({
    method: 'POST',
    url: '/hosted/user/passkey/register',
    data: authToken,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return data;
};

const generateDeviceResponse = async ({
  publicKey,
}: BiometricRegisterChallengeJson) => {
  const result = (await Passkey.register({
    challenge: base64url.toBase64(publicKey.challenge as unknown as string),
    rp: {
      id: publicKey.rp.id as string,
      name: publicKey.rp.name,
    },
    user: {
      id: base64url.toBase64(publicKey.user.id as unknown as string),
      name: publicKey.user.name,
      displayName: publicKey.user.displayName,
    },
    pubKeyCredParams: publicKey.pubKeyCredParams,
    timeout: publicKey.timeout,
    attestation: publicKey.attestation,
    authenticatorSelection: {
      ...publicKey.authenticatorSelection,
      requireResidentKey: true,
    },
  })) as RegisterResponse;
  const response = {
    rawId: base64url.toBase64(result.rawId),
    id: result.id,
    type: 'public-key',
    response: {
      clientDataJSON: result.response.clientDataJSON,
      attestationObject: result.response.attestationObject,
    },
  };
  return JSON.stringify(response);
};

const register = async ({
  authToken,
  deviceResponseJson,
  challengeToken,
}: {
  authToken: string;
  deviceResponseJson: unknown;
  challengeToken: string;
}) => {
  const response = await request<BiometricRegisterResponse>({
    method: 'POST',
    url: '/hosted/user/passkey',
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

const registerPasskeys = async (authToken: string) => {
  const { challengeToken, challengeJson } = await biometricInit(authToken);
  const challenge = JSON.parse(challengeJson) as BiometricRegisterChallengeJson;
  const deviceResponseJson = await generateDeviceResponse(challenge);
  await register({
    authToken,
    challengeToken,
    deviceResponseJson,
  });
  return deviceResponseJson;
};

const useRegisterPasskeys = () => useMutation(registerPasskeys);

export default useRegisterPasskeys;
