import useIdentify, { IdentifyResponse } from 'src/hooks/identify/use-identify';
import useIdentifyVerify, {
  IdentifyVerifyResponse,
} from 'src/hooks/identify/use-identify-verify';
import useBifrostMachine, { Events } from 'src/hooks/use-bifrost-machine';
import useOnboarding, {
  OnboardingResponse,
} from 'src/pages/phone-verification/hooks/use-onboarding';
import generateLoginDeviceResponse from 'src/utils/biometric/login-challenge-response';
import { ChallengeData, ChallengeKind } from 'src/utils/state-machine/types';

const useEmailIdentify = () => {
  const [state, send] = useBifrostMachine();
  const identifyMutation = useIdentify();
  const identifyVerifyMutation = useIdentifyVerify();
  const onboardingMutation = useOnboarding();

  const isLoading = () =>
    identifyMutation.isLoading ||
    identifyVerifyMutation.isLoading ||
    onboardingMutation.isLoading;

  const identifyEmail = (email: string) => {
    const preferredChallengeKind =
      state.context.device.hasSupportForWebAuthn &&
      state.context.device.type === 'mobile'
        ? ChallengeKind.biometric
        : ChallengeKind.sms;
    identifyMutation.mutate(
      { identifier: { email }, preferredChallengeKind },
      {
        onSuccess({ userFound, challengeData }: IdentifyResponse) {
          if (
            userFound &&
            challengeData?.challengeKind === ChallengeKind.biometric
          ) {
            handleBiometricChallenge(email, challengeData);
          } else {
            handlePhoneChallenge(email, userFound, challengeData);
          }
        },
      },
    );
  };

  const startOnboarding = (email: string, authToken: string) => {
    onboardingMutation.mutate(
      { authToken },
      {
        onSuccess({
          missingAttributes,
          missingWebauthnCredentials,
        }: OnboardingResponse) {
          send({
            type: Events.biometricLoginSucceeded,
            payload: {
              authToken,
              email,
              userFound: true,
              missingAttributes,
              missingWebauthnCredentials,
            },
          });
        },
      },
    );
  };

  const handleBiometricChallenge = async (
    email: string,
    challengeData: ChallengeData,
  ) => {
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
        challengeKind: ChallengeKind.biometric,
        challengeResponse,
        challengeToken,
      },
      {
        onSuccess: ({ authToken }: IdentifyVerifyResponse) => {
          startOnboarding(email, authToken);
        },
        onError: () => {
          send({
            type: Events.biometricLoginFailed,
            payload: {
              email,
              userFound: true,
            },
          });
        },
      },
    );
  };

  const handlePhoneChallenge = (
    email: string,
    userFound: boolean,
    challengeData?: ChallengeData,
  ) => {
    if (userFound) {
      send({
        type: Events.userIdentifiedByEmail,
        payload: {
          email,
          challengeData,
          userFound,
        },
      });
      return;
    }
    send({
      type: Events.userNotIdentified,
      payload: {
        email,
        userFound,
      },
    });
  };

  return { identifyEmail, isLoading };
};

export default useEmailIdentify;
