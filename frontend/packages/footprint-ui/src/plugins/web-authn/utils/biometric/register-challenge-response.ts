import { BiometricRegisterChallengeJson } from '@onefootprint/types';
import base64url from 'base64url';

const createPublicKeyCredential = async (challenge: string) => {
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
  return publicKeyCredential;
};

const generateRegisterDeviceResponse = async (challengeJson: string) => {
  const publicKeyCredential = await createPublicKeyCredential(challengeJson);
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

export default generateRegisterDeviceResponse;
