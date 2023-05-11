import request, { getErrorMessage } from '@onefootprint/request';
import {
  BiometricLoginChallengeJson,
  ChallengeKind,
  Identifier,
  IdentifyVerifyRequest,
  IdentifyVerifyResponse,
  LoginChallengeResponse,
} from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import base64url from 'base64url';
import { Passkey } from 'react-native-passkey';

import useTranslation from '@/hooks/use-translation';

import hasUserCancelledPasskey from '../utils/has-user-canceled-passkey';

const passkey = new Passkey('onefootprint.com', 'Footprint');

const loginChallenge = async (identifier: Identifier) => {
  const response = await request<LoginChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/login_challenge',
    data: {
      identifier,
      preferredChallengeKind: ChallengeKind.biometric,
    },
  });
  return response.data;
};

const generateDeviceResponse = async (challenge: string) => {
  const challengeJson = JSON.parse(challenge) as BiometricLoginChallengeJson;
  const { publicKey } = challengeJson;
  const result = await passkey.auth(
    base64url.toBase64(publicKey.challenge as unknown as string),
  );
  const pk = {
    rawId: base64url.toBase64(result.credentialID),
    id: result.credentialID,
    type: 'public-key',
    response: {
      clientDataJSON: result.response.rawClientDataJSON,
      authenticatorData: result.response.rawAuthenticatorData,
      signature: result.response.signature,
    },
  };
  return JSON.stringify(pk);
};

const identifyVerify = async (payload: IdentifyVerifyRequest) => {
  const response = await request<IdentifyVerifyResponse>({
    method: 'POST',
    url: '/hosted/identify/verify',
    data: payload,
  });
  return response.data;
};

const authenticateWithPasskey = async (identifier: Identifier) => {
  const {
    challengeData: { biometricChallengeJson, challengeToken },
  } = await loginChallenge(identifier);
  const challengeResponse = await generateDeviceResponse(
    biometricChallengeJson,
  );
  const response = await identifyVerify({ challengeResponse, challengeToken });
  return response;
};

const useAuthenticateWithPasskey = () => {
  const { t } = useTranslation('screens.login.passkey.notifications');
  const toast = useToast();

  return useMutation({
    mutationFn: authenticateWithPasskey,
    onError: (error: unknown) => {
      if (hasUserCancelledPasskey(error)) return;
      toast.show({
        description: getErrorMessage(error),
        title: t('error.title'),
        variant: 'error',
      });
    },
  });
};

export default useAuthenticateWithPasskey;
