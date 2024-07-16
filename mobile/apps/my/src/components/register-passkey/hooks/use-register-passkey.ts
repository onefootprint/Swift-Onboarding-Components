import request from '@onefootprint/request';
import {
  AuthMethodKind,
  type BiometricRegisterChallengeJson,
  type BiometricRegisterResponse,
  UpdateAuthMethodActionKind,
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
    biometricChallengeJson: string;
  }>({
    method: 'POST',
    url: '/hosted/user/challenge',
    data: {
      kind: AuthMethodKind.passkey,
      actionKind: UpdateAuthMethodActionKind.addPrimary,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });
  return data;
};

const generateDeviceResponse = async ({ publicKey }: BiometricRegisterChallengeJson) => {
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
  challengeResponse,
  challengeToken,
}: {
  authToken: string;
  challengeResponse: unknown;
  challengeToken: string;
}) => {
  const response = await request<BiometricRegisterResponse>({
    method: 'POST',
    url: '/hosted/user/challenge/verify',
    data: {
      challengeResponse,
      challengeToken,
    },
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  return response;
};

/// A special kind of error returned when we fail to register a passkey in the OS prompt
type RegisterPasskeyError = {
  kind: 'registerPasskeyError';
  elapsedTimeInOsPromptMs: number;
  error: unknown;
};

export const isRegisterPasskeyError = (e: unknown): e is RegisterPasskeyError =>
  (e as RegisterPasskeyError)?.kind === 'registerPasskeyError';

const registerPasskey = async (authToken: string) => {
  const { challengeToken, biometricChallengeJson } = await biometricInit(authToken);
  const challenge = JSON.parse(biometricChallengeJson) as BiometricRegisterChallengeJson;

  const startPasskeyRegister = new Date();
  let challengeResponse;
  try {
    challengeResponse = await generateDeviceResponse(challenge);
  } catch (error) {
    const endPasskeyRegister = new Date();
    const elapsedTimeInOsPromptMs = endPasskeyRegister.getTime() - startPasskeyRegister.getTime();
    const e: RegisterPasskeyError = {
      kind: 'registerPasskeyError',
      elapsedTimeInOsPromptMs,
      error,
    };
    return Promise.reject(e);
  }

  await register({
    authToken,
    challengeToken,
    challengeResponse,
  });
  return challengeResponse;
};

const useRegisterPasskey = () => useMutation(registerPasskey);

export default useRegisterPasskey;
