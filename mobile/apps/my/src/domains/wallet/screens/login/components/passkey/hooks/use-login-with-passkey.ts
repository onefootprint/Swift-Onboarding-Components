import request from '@onefootprint/request';
import type {
  BiometricLoginChallengeJson,
  IdentifyVerifyRequest,
  IdentifyVerifyResponse,
  LoginChallengeResponse,
} from '@onefootprint/types';
import { ChallengeKind } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import base64url from 'base64url';
import { Passkey } from 'react-native-passkey';

import { AUTH_HEADER } from '@/config/constants';
import useRequestError from '@/hooks/use-request-error';
import useTranslation from '@/hooks/use-translation';

import hasUserCancelledPasskey from '../utils/has-user-canceled-passkey';

const loginChallenge = async (authToken: string) => {
  const headers = {
    [AUTH_HEADER]: authToken,
  };
  const response = await request<LoginChallengeResponse>({
    method: 'POST',
    url: '/hosted/identify/login_challenge',
    headers,
    data: {
      preferredChallengeKind: ChallengeKind.biometric,
    },
  });
  return response.data;
};

const generateDeviceResponse = async (challenge: string) => {
  const challengeJson = JSON.parse(challenge) as BiometricLoginChallengeJson;
  const { publicKey } = challengeJson;
  const result = await Passkey.authenticate({
    challenge: base64url.toBase64(publicKey.challenge as unknown as string),
    timeout: publicKey.timeout,
    userVerification: publicKey.userVerification,
    rpId: publicKey.rpId,
  });
  const pk = {
    rawId: base64url.toBase64(result.rawId),
    id: result.id,
    type: 'public-key',
    response: {
      clientDataJSON: base64url.toBase64(result.response.clientDataJSON),
      authenticatorData: base64url.toBase64(result.response.authenticatorData),
      signature: result.response.signature,
    },
  };
  return JSON.stringify(pk);
};

const identifyVerify = async (payload: IdentifyVerifyRequest) => {
  const data = {
    ...payload,
    scope: 'my1fp',
  };
  const response = await request<IdentifyVerifyResponse>({
    method: 'POST',
    url: '/hosted/identify/verify',
    data,
  });
  return response.data;
};

const loginWithPasskey = async (authToken: string) => {
  const {
    challengeData: { biometricChallengeJson, challengeToken },
  } = await loginChallenge(authToken);
  const challengeResponse = await generateDeviceResponse(biometricChallengeJson);
  const response = await identifyVerify({ challengeResponse, challengeToken });
  return response;
};

const useLoginWithPasskey = () => {
  const { t } = useTranslation('screens.login.passkey.notifications');
  const { getErrorMessage } = useRequestError();
  const toast = useToast();

  return useMutation({
    mutationFn: loginWithPasskey,
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

export default useLoginWithPasskey;
