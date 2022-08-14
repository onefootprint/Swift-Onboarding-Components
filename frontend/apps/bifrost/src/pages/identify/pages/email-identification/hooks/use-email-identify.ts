import { useRequestErrorToast } from 'hooks';
import useIdentify, {
  IdentifyResponse,
} from 'src/pages/identify/hooks/use-identify';
import useIdentityVerification, {
  IdentifyVerifyResponse,
} from 'src/pages/identify/hooks/use-identify-verify';
import generateLoginDeviceResponse from 'src/utils/biometric/login-challenge-response';
import {
  ChallengeData,
  ChallengeKind,
  Events,
} from 'src/utils/state-machine/identify/types';

import useIdentifyMachine from '../../../hooks/use-identify-machine';

const useEmailIdentify = () => {
  const [state, send] = useIdentifyMachine();
  const {
    context: { identifyType },
  } = state;
  const identifyMutation = useIdentify();
  const identifyVerifyMutation = useIdentityVerification();
  const showRequestErrorToast = useRequestErrorToast();

  const isLoading = () =>
    identifyMutation.isLoading || identifyVerifyMutation.isLoading;

  const identifyEmail = (
    email: string,
    preferredChallengeKind: ChallengeKind,
  ) => {
    identifyMutation.mutate(
      { identifier: { email }, preferredChallengeKind, identifyType },
      {
        onSuccess({ userFound, challengeData }: IdentifyResponse) {
          send({
            type: Events.emailIdentificationCompleted,
            payload: {
              userFound,
              challengeData,
              email,
            },
          });
          if (
            userFound &&
            challengeData?.challengeKind === ChallengeKind.biometric
          ) {
            handleBiometricChallenge(challengeData);
          }
        },
        onError: showRequestErrorToast,
      },
    );
  };

  const handleBiometricChallenge = async (challengeData: ChallengeData) => {
    const { biometricChallengeJson, challengeToken } = challengeData;
    // TODO: log this error if we din't get a biometricChallengeJson
    // https://linear.app/footprint/issue/FP-196
    if (!biometricChallengeJson) {
      return;
    }
    const challengeResponse = await generateLoginDeviceResponse(
      biometricChallengeJson,
    );
    identifyVerifyMutation.mutate(
      {
        challengeResponse,
        challengeToken,
      },
      {
        onSuccess: ({ authToken }: IdentifyVerifyResponse) => {
          send({
            type: Events.biometricLoginSucceeded,
            payload: {
              authToken,
            },
          });
        },
        onError: () => {
          send({
            type: Events.biometricLoginFailed,
          });
        },
      },
    );
  };

  return { identifyEmail, isLoading };
};

export default useEmailIdentify;
