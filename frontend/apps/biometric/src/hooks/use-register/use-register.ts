import { useMutation } from '@tanstack/react-query';
import base64url from 'base64url';
import request, { RequestError } from 'request';
import { BIOMETRIC_AUTH_HEADER } from 'src/config/constants';

export type RegisterRequest = {
  authToken: string;
};

export type RegisterResponse = {
  data: string;
};

type ChallengeJson = {
  userVaultId: string;
  credentialId: string;
  publicKey: PublicKeyCredentialCreationOptions;
  attestationData: string[];
};

const generateDeviceResponse = async (challenge: string) => {
  const challengeJson = JSON.parse(challenge) as ChallengeJson;
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
    (publicKeyCredential.response as any).attestationObject as Buffer,
  );
  const clientDataJSON = base64url.encode(
    publicKeyCredential.response.clientDataJSON as Buffer,
  );
  const pk = {
    rawId: base64url.encode(publicKeyCredential.rawId as Buffer),
    id: publicKeyCredential.id,
    type: 'public-key',
    response: {
      clientDataJSON,
      attestationObject,
    },
  };
  return JSON.stringify(pk);
};

const register = async (payload: RegisterRequest) => {
  const { authToken } = payload;
  const initResponse = await request<{
    challengeToken: string;
    challengeJson: string;
  }>({
    method: 'POST',
    url: '/hosted/user/biometric/init',
    data: payload,
    headers: {
      [BIOMETRIC_AUTH_HEADER]: authToken,
    },
  });

  const { challengeToken, challengeJson } = initResponse.data;
  const deviceResponseJson = await generateDeviceResponse(challengeJson);

  const response = await request<RegisterResponse>({
    method: 'POST',
    url: '/hosted/user/biometric',
    data: {
      deviceResponseJson,
      challengeToken,
    },
    headers: {
      [BIOMETRIC_AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useRegister = () =>
  useMutation<RegisterResponse, RequestError, RegisterRequest>(register);

export default useRegister;
