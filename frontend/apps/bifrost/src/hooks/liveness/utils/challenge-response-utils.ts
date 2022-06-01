import base64url from 'base64url';

export type LivenessChallengeJson = {
  userVaultId: string;
  credentialId: string;
  publicKey: PublicKeyCredentialCreationOptions;
  attestationData: string[];
};

export const parseChallenge = async (challenge: string) => {
  const challengeJson = JSON.parse(challenge) as LivenessChallengeJson;
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
