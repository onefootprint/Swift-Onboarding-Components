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

const useBiometricLoginRetry = () => {
  const [state, send] = useBifrostMachine();
  const identifyMutation = useIdentify();
  const identifyVerifyMutation = useIdentifyVerify();
  const onboardingMutation = useOnboarding();

  const requestBiometricChallenge = () => {
    identifyMutation.mutate(
      {
        identifier: { email: state.context.email },
        preferredChallengeKind: ChallengeKind.biometric,
      },
      {
        onSuccess({ challengeData }: IdentifyResponse) {
          if (challengeData?.challengeKind === ChallengeKind.biometric) {
            handleBiometricChallenge(challengeData);
          } else {
            handlePhoneChallenge(challengeData);
          }
        },
      },
    );
  };

  const requestPhoneChallenge = () => {
    identifyMutation.mutate(
      {
        identifier: { email: state.context.email },
        preferredChallengeKind: ChallengeKind.sms,
      },
      {
        onSuccess({ challengeData }: IdentifyResponse) {
          handlePhoneChallenge(challengeData);
        },
      },
    );
  };

  const startOnboarding = (authToken: string) => {
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
              email: state.context.email,
              userFound: true,
              missingAttributes,
              missingWebauthnCredentials,
            },
          });
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
    identifyVerifyMutation.mutate(
      {
        challengeKind: ChallengeKind.biometric,
        challengeResponse,
        challengeToken,
      },
      {
        onSuccess: ({ authToken }: IdentifyVerifyResponse) => {
          startOnboarding(authToken);
        },
      },
    );
  };

  const handlePhoneChallenge = (challengeData?: ChallengeData) => {
    if (challengeData) {
      send({
        type: Events.smsChallengeInitiated,
        payload: {
          challengeData,
        },
      });
    }
  };

  return [requestBiometricChallenge, requestPhoneChallenge];
};

export default useBiometricLoginRetry;
