import type { BiometricRegisterChallengeJson, BiometricRegisterRequest } from '@onefootprint/types';
import { AuthMethodKind } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import base64url from 'base64url';

import { useUserChallenge, useUserChallengeVerify } from '../../../components/identify/queries';

const registerPasskeyOnDevice = async (challenge: string) => {
  const challengeJson = JSON.parse(challenge) as BiometricRegisterChallengeJson;
  const { publicKey } = challengeJson;
  publicKey.challenge = base64url.toBuffer(publicKey.challenge as unknown as string);
  publicKey.user.id = base64url.toBuffer(publicKey.user.id as unknown as string);
  const publicKeyCredential = (await window.navigator.credentials.create({
    publicKey,
  })) as PublicKeyCredential;
  const attestationObject = base64url.encode(
    // @ts-expect-error: fix-me Property 'attestationObject' does not exist on type 'AuthenticatorResponse'....
    publicKeyCredential.response.attestationObject as unknown as Buffer,
  );
  const clientDataJSON = base64url.encode(publicKeyCredential.response.clientDataJSON as unknown as Buffer);
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

/// A special kind of error returned when we fail to register a passkey in the OS prompt
type RegisterPasskeyError = {
  kind: 'registerPasskeyError';
  elapsedTimeInOsPromptMs: number;
  error: unknown;
};

export const isRegisterPasskeyError = (e: unknown): e is RegisterPasskeyError =>
  (e as RegisterPasskeyError)?.kind === 'registerPasskeyError';

const useBiometricInit = () => {
  const userChallengeMut = useUserChallenge();
  const userChallengeVerifyMut = useUserChallengeVerify();

  return useMutation({
    mutationFn: async ({ authToken, actionKind }: BiometricRegisterRequest) => {
      const { challengeToken, biometricChallengeJson } = await userChallengeMut.mutateAsync({
        authToken,
        kind: AuthMethodKind.passkey,
        actionKind,
      });

      if (!biometricChallengeJson) {
        throw new Error('No biometric challenge JSON when registering passkey');
      }

      const startPasskeyRegister = new Date();
      let challengeResponse;
      try {
        challengeResponse = await registerPasskeyOnDevice(biometricChallengeJson);
      } catch (error) {
        const endPasskeyRegister = new Date();
        const elapsedTimeInOsPromptMs = endPasskeyRegister.getTime() - startPasskeyRegister.getTime();
        const e: RegisterPasskeyError = {
          kind: 'registerPasskeyError',
          elapsedTimeInOsPromptMs,
          error,
        };
        return Promise.reject(e);
      }

      const response = await userChallengeVerifyMut.mutateAsync({
        authToken,
        challengeToken,
        challengeResponse,
      });

      return { response, deviceResponseJson: challengeResponse };
    },
  });
};

export default useBiometricInit;
