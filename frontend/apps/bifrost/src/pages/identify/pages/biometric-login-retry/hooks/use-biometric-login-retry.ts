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

const useBiometricLoginRetry = () => {
  const [state, send] = useIdentifyMachine();
  const identifyMutation = useIdentify();
  const identityVerificationMutation = useIdentityVerification();

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
          send({
            type: Events.biometricLoginSucceeded,
            payload: {
              authToken,
            },
          });
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
