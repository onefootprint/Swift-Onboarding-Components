import base64url from 'base64url';

export type BiometricChallengeJson = {
  userVaultId: string;
  credentialId: string;
  publicKey: PublicKeyCredentialCreationOptions;
  attestationData: string[];
};

export const createPublicKeyCredential = async (challenge: string) => {
  const publicKey = parseChallenge(challenge);
  const publicKeyCredential = (await window.navigator.credentials.create({
    publicKey,
  })) as PublicKeyCredential;
  return publicKeyCredential;
};

export const getPublicKeyCredential = async (challenge: string) => {
  const publicKey = parseChallenge(challenge);
  const publicKeyCredential = (await window.navigator.credentials.get({
    publicKey,
  })) as PublicKeyCredential;
  return publicKeyCredential;
};

const parseChallenge = (challenge: string) => {
  const challengeJson = JSON.parse(challenge) as BiometricChallengeJson;
  const { publicKey } = challengeJson;
  publicKey.challenge = base64url.toBuffer(
    publicKey.challenge as unknown as string,
  );
  publicKey.user.id = base64url.toBuffer(
    publicKey.user.id as unknown as string,
  );
  return publicKey;
};

export const generateDeviceResponse = (
  publicKeyCredential: PublicKeyCredential,
) => {
  const attestationObject = base64url.encode(
    // @ts-ignore
    publicKeyCredential.response.attestationObject as Buffer,
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
