import type { BiometricLoginChallengeJson } from '@onefootprint/types';
import base64url from 'base64url';

import { isError, isObject, isString } from '../../../../../../../../../../utils';

const isWebAuthApiSupported = (): boolean =>
  typeof PublicKeyCredential !== 'undefined' &&
  typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';

const parseBiometricChallenge = (str: string): BiometricLoginChallengeJson | Error => {
  try {
    const has = Object.prototype.hasOwnProperty;
    const parsedObj = JSON.parse(str);
    const runTimeVerification =
      isObject(parsedObj) &&
      has.call(parsedObj, 'publicKey') &&
      isObject(parsedObj.publicKey) &&
      has.call(parsedObj.publicKey, 'allowCredentials') &&
      has.call(parsedObj.publicKey, 'challenge');

    return runTimeVerification
      ? (parsedObj as BiometricLoginChallengeJson)
      : new Error('Invalid biometric challenge structure');
  } catch (err: unknown) {
    return err instanceof Error
      ? new Error(`Error parsing biometric challenge: ${err.message}`)
      : new Error(`Error parsing biometric challenge`);
  }
};

const getPublicKeyCredential = async (str: string): Promise<PublicKeyCredential> => {
  if (!isWebAuthApiSupported()) {
    throw new Error('WebAuthn API is not fully supported in this browser.');
  }

  try {
    const parsedChallenge = parseBiometricChallenge(str);
    if (isError(parsedChallenge)) {
      throw parsedChallenge;
    }
    const { publicKey } = parsedChallenge;

    if (!isString(publicKey.challenge)) {
      throw new Error('Invalid publicKey.challenge format');
    }

    publicKey.challenge = base64url.toBuffer(publicKey.challenge);

    if (publicKey.allowCredentials) {
      if (!Array.isArray(publicKey.allowCredentials)) {
        throw new Error('Invalid allowCredentials format.');
      }

      publicKey.allowCredentials = publicKey.allowCredentials.map(c => ({
        ...c,
        id: isString(c.id) ? base64url.toBuffer(c.id) : c.id,
      }));
    }

    const publicKeyCredential = (await window.navigator.credentials.get({
      publicKey,
    })) as PublicKeyCredential;

    if (!publicKeyCredential) {
      throw new Error('Failed to retrieve public key credential');
    }

    return publicKeyCredential;
  } catch (err) {
    throw err instanceof Error
      ? new Error(`Error in getPublicKeyCredential: ${err.message}`)
      : new Error('Error in getPublicKeyCredential');
  }
};

const getBiometricChallengeResponse = async (str: string) => {
  try {
    const publicKeyCredential = await getPublicKeyCredential(str);
    const { rawId, id, response } = publicKeyCredential;
    // @ts-expect-error: fix-me Property 'signature' does not exist on type 'AuthenticatorResponse'....
    const { signature, authenticatorData, clientDataJSON } = response;

    const pk = {
      id,
      type: 'public-key',
      // @ts-expect-error: Argument of type 'ArrayBuffer' is not assignable to parameter of type 'string | Buffer'.
      rawId: base64url.encode(rawId),
      response: {
        authenticatorData: base64url.encode(authenticatorData),
        // @ts-expect-error: Argument of type 'ArrayBuffer' is not assignable to parameter of type 'string | Buffer'.
        clientDataJSON: base64url.encode(clientDataJSON),
        signature: base64url.encode(signature),
      },
    };

    return JSON.stringify(pk);
  } catch (err) {
    throw err instanceof Error
      ? new Error(`Error in getBiometricChallengeResponse: ${err.message}`)
      : new Error('Error in getBiometricChallengeResponse');
  }
};

export default getBiometricChallengeResponse;
