import useIdentify, { IdentifyResponse } from 'src/hooks/identify/use-identify';
import useBifrostMachine, { Events } from 'src/hooks/use-bifrost-machine';
import useIdentityVerification, {
  IdentifyVerificationResponse,
} from 'src/hooks/use-identify-verification';
import useOnboarding from 'src/hooks/use-onboarding';
import generateLoginDeviceResponse from 'src/utils/biometric/login-challenge-response';
import { ChallengeData, ChallengeKind } from 'src/utils/state-machine/types';

const useEmailIdentify = () => {
  const [state, send] = useBifrostMachine();
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
    const tenantPk = state.context.tenant.pk;
    onboardingMutation.mutate(
      { authToken, tenantPk },
      {
        onSuccess({ missingAttributes, missingWebauthnCredentials }) {
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
    identifyVerificationMutation.mutate(
      {
        challengeKind: ChallengeKind.biometric,
        challengeResponse,
        challengeToken,
      },
      {
        onSuccess: ({ authToken }: IdentifyVerificationResponse) => {
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
