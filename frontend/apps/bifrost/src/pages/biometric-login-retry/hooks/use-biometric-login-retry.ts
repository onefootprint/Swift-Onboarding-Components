import useIdentify, { IdentifyResponse } from 'src/hooks/identify/use-identify';
import useBifrostMachine, { Events } from 'src/hooks/use-bifrost-machine';
import useIdentityVerification, {
  IdentifyVerificationResponse,
} from 'src/hooks/use-identify-verification';
import useOnboarding from 'src/hooks/use-onboarding';
import generateLoginDeviceResponse from 'src/utils/biometric/login-challenge-response';
import { ChallengeData, ChallengeKind } from 'src/utils/state-machine/types';

const useBiometricLoginRetry = () => {
  const [state, send] = useBifrostMachine();
  const identifyMutation = useIdentify();
  const identityVerificationMutation = useIdentityVerification();
  const onboardingMutation = useOnboarding();

  const requestBiometricChallenge = () => {
    identifyMutation.mutate(
      {
        identifier: { email: state.context.email },
        identifyType: state.context.identifyType,
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
        identifyType: state.context.identifyType,
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
    const tenantPk = state.context.tenant.pk;
    onboardingMutation.mutate(
      { authToken, tenantPk },
      {
        onSuccess({ missingAttributes, missingWebauthnCredentials }) {
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
    identityVerificationMutation.mutate(
      {
        challengeKind: ChallengeKind.biometric,
        challengeResponse,
        challengeToken,
      },
      {
        onSuccess: ({ authToken }: IdentifyVerificationResponse) => {
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
