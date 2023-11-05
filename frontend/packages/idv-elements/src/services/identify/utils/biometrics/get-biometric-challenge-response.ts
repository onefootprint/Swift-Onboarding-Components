import type { BiometricLoginChallengeJson } from '@onefootprint/types';
import base64url from 'base64url';

const getPublicKeyCredential = async (challenge: string) => {
  const challengeJson = JSON.parse(challenge) as BiometricLoginChallengeJson;
  const { publicKey } = challengeJson;
  publicKey.challenge = base64url.toBuffer(
    publicKey.challenge as unknown as string,
  );
  publicKey.allowCredentials = publicKey.allowCredentials?.map(c => ({
    ...c, // @ts-expect-error: fix-me Argument of type 'BufferSource' is not assignable to parameter of type 'string'...
    id: base64url.toBuffer(c.id),
  }));
  const publicKeyCredential = (await window.navigator.credentials.get({
    publicKey,
  })) as PublicKeyCredential;
  return publicKeyCredential;
};

const getBiometricChallengeResponse = async (challengeJson: string) => {
  const publicKeyCredential = await getPublicKeyCredential(challengeJson);
  const signature = base64url.encode(
    // @ts-expect-error: fix-me Property 'signature' does not exist on type 'AuthenticatorResponse'....
    publicKeyCredential.response.signature as Buffer,
  );
  const authenticatorData = base64url.encode(
    // @ts-expect-error: fix-me Property 'authenticatorData' does not exist on type 'AuthenticatorResponse'....
    publicKeyCredential.response.authenticatorData as Buffer,
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
      authenticatorData,
      signature,
    },
  };
  return JSON.stringify(pk);
};

export default getBiometricChallengeResponse;
