import request from '@onefootprint/request';
import type {
  BiometricRegisterChallengeJson,
  BiometricRegisterRequest,
  BiometricRegisterResponse,
} from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import base64url from 'base64url';

const generateDeviceResponse = async (challenge: string) => {
  const challengeJson = JSON.parse(challenge) as BiometricRegisterChallengeJson;
  const { publicKey } = challengeJson;
  publicKey.challenge = base64url.toBuffer(
    publicKey.challenge as unknown as string,
  );
  publicKey.user.id = base64url.toBuffer(
    publicKey.user.id as unknown as string,
  );
  const publicKeyCredential = (await window.navigator.credentials.create({
    publicKey,
  })) as PublicKeyCredential;
  const attestationObject = base64url.encode(
    // @ts-expect-error: fix-me Property 'attestationObject' does not exist on type 'AuthenticatorResponse'....
    publicKeyCredential.response.attestationObject as unknown as Buffer,
  );
  const clientDataJSON = base64url.encode(
    publicKeyCredential.response.clientDataJSON as unknown as Buffer,
  );
  const pk = {
    rawId: base64url.encode(publicKeyCredential.rawId as unknown as Buffer),
    id: publicKeyCredential.id,
    type: 'public-key',
    response: {
      clientDataJSON,
      attestationObject,
    },
  };
  return JSON.stringify(pk);
};

const biometricInit = async (payload: BiometricRegisterRequest) => {
  const { authToken } = payload;
  const initResponse = await request<{
    challengeToken: string;
    challengeJson: string;
  }>({
    method: 'POST',
    url: '/hosted/user/passkey/register',
    data: payload,
    headers: {
      [AUTH_HEADER]: authToken,
    },
  });

  const { challengeToken, challengeJson } = initResponse.data;
  const deviceResponseJson = await generateDeviceResponse(challengeJson);

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
  return response.data;
};

const useBiometricInit = () => useMutation(biometricInit);

export default useBiometricInit;
