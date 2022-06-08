import base64url from 'base64url';
import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

export type BiometricRegisterRequest = {
  authToken: string;
};

export type BiometricRegisterResponse = {
  data: string;
};

type BiometricChallengeJson = {
  userVaultId: string;
  credentialId: string;
  publicKey: PublicKeyCredentialCreationOptions;
  attestationData: string[];
};

const generateDeviceResponse = async (challenge: string) => {
  const challengeJson = JSON.parse(challenge) as BiometricChallengeJson;
  const { publicKey } = challengeJson;
  publicKey.challenge = base64url.toBuffer(
    publicKey.challenge as unknown as string,
  );
  publicKey.user.id = base64url.toBuffer(
    publicKey.user.id as unknown as string,
  );
  const attestationObject = base64url.encode(
    // @ts-ignore
    publicKey.response.attestationObject as Buffer,
  );

  const publicKeyCredential = (await window.navigator.credentials.create({
    publicKey,
  })) as PublicKeyCredential;

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

  const { challengeToken } = initResponse.data;
  const deviceResponseJson = generateDeviceResponse(
    initResponse.data.challengeJson,
  );

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
