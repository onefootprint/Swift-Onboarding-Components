import type {
  BiometricRegisterChallengeJson,
  BiometricRegisterRequest,
} from '@onefootprint/types';
import { AuthMethodKind } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import base64url from 'base64url';

import { UpdateAuthMethodActionKind } from '../../../components/identify';
import {
  useUserChallenge,
  useUserChallengeVerify,
} from '../../../components/identify/queries';

const registerPasskeyOnDevice = async (challenge: string) => {
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

const useBiometricInit = () => {
  const userChallengeMut = useUserChallenge();
  const userChallengeVerifyMut = useUserChallengeVerify();

  const biometricInit = async (payload: BiometricRegisterRequest) => {
    const { authToken } = payload;

    const { challengeToken, biometricChallengeJson } =
      await userChallengeMut.mutateAsync({
        authToken,
        kind: AuthMethodKind.passkey,
        actionKind: UpdateAuthMethodActionKind.addPrimary,
      });

    if (!biometricChallengeJson) {
      throw new Error('No biometric challenge JSON when registering passkey');
    }

    const challengeResponse = await registerPasskeyOnDevice(
      biometricChallengeJson,
    );

    const response = await userChallengeVerifyMut.mutateAsync({
      authToken,
      challengeToken,
      challengeResponse,
    });

    return { response, deviceResponseJson: challengeResponse };
  };

  return useMutation(biometricInit);
};

export default useBiometricInit;
