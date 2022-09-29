import request, { RequestError } from '@onefootprint/request';
import {
  BiometricRegisterChallengeJson,
  BiometricRegisterRequest,
  BiometricRegisterResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import base64url from 'base64url';
import { HANDOFF_AUTH_HEADER } from 'src/config/constants';

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

const register = async (payload: BiometricRegisterRequest) => {
  const { authToken } = payload;
  const initResponse = await request<{
    challengeToken: string;
    challengeJson: string;
  }>({
    method: 'POST',
    url: '/hosted/user/biometric/init',
    data: payload,
    headers: {
      [HANDOFF_AUTH_HEADER]: authToken,
    },
  });

  const { challengeToken, challengeJson } = initResponse.data;
  const deviceResponseJson = await generateDeviceResponse(challengeJson);

  const response = await request<BiometricRegisterResponse>({
    method: 'POST',
    url: '/hosted/user/biometric',
    data: {
      deviceResponseJson,
      challengeToken,
    },
    headers: {
      [HANDOFF_AUTH_HEADER]: authToken,
    },
  });
  return response.data;
};

const useRegister = () =>
  useMutation<
    BiometricRegisterResponse,
    RequestError,
    BiometricRegisterRequest
  >(register);

export default useRegister;
