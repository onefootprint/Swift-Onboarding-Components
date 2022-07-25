import useOnboarding from 'src/hooks/use-onboarding';
import useIdentify, {
  IdentifyResponse,
} from 'src/pages/identify/hooks/use-identify';
import useIdentityVerification, {
  IdentifyVerificationResponse,
} from 'src/pages/identify/hooks/use-identity-verification';
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
    context: { device, identifyType },
  } = state;
  const identifyMutation = useIdentify();
  const identifyVerificationMutation = useIdentityVerification();
  const onboardingMutation = useOnboarding();

  const isLoading = () =>
    identifyMutation.isLoading ||
    identifyVerificationMutation.isLoading ||
    onboardingMutation.isLoading;

  const identifyEmail = (email: string) => {
    const preferredChallengeKind =
      device.hasSupportForWebAuthn && device.type === 'mobile'
        ? ChallengeKind.biometric
        : ChallengeKind.sms;
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
    identifyVerificationMutation.mutate(
      {
        challengeKind: ChallengeKind.biometric,
        challengeResponse,
        challengeToken,
      },
      {
        onSuccess: ({ authToken }: IdentifyVerificationResponse) => {
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
