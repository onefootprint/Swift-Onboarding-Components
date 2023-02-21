import {
  useIdentifyVerify,
  useLoginChallenge,
} from '@onefootprint/footprint-elements';
import {
  ChallengeData,
  ChallengeKind,
  IdentifyVerifyResponse,
  LoginChallengeResponse,
} from '@onefootprint/types';
import generateLoginDeviceResponse from 'src/pages/identify/utils/biometric/login-challenge-response';
import { Events } from 'src/utils/state-machine/identify/types';

import useIdentifyMachine from '../../../hooks/use-identify-machine';

const useBiometricLoginRetry = () => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { email },
    tenantPk,
  } = state.context;
  const loginChallengeMutation = useLoginChallenge();
  const identityVerifyMutation = useIdentifyVerify();

  const requestLoginChallenge = (preferredChallengeKind: ChallengeKind) => {
    if (!email) {
      return;
    }
    loginChallengeMutation.mutate(
      {
        identifier: { email },
        preferredChallengeKind,
      },
      {
        onSuccess({ challengeData }: LoginChallengeResponse) {
          const { challengeKind } = challengeData;
          if (challengeKind === ChallengeKind.biometric) {
            handleBiometricChallenge(challengeData);
          } else {
            handlePhoneChallenge(challengeData);
          }
        },
      },
    );
  };

  const requestBiometricChallenge = () => {
    requestLoginChallenge(ChallengeKind.biometric);
  };

  const requestPhoneChallenge = () => {
    requestLoginChallenge(ChallengeKind.sms);
  };

  const handleBiometricChallenge = async (challengeData: ChallengeData) => {
    const { biometricChallengeJson, challengeToken } = challengeData;
    if (!biometricChallengeJson) {
      return;
    }
    const challengeResponse = await generateLoginDeviceResponse(
      biometricChallengeJson,
    );
    identityVerifyMutation.mutate(
      {
        challengeResponse,
        challengeToken,
        tenantPk,
      },
      {
        onSuccess: ({ authToken }: IdentifyVerifyResponse) => {
          send({
            type: Events.challengeSucceeded,
            payload: {
              authToken,
            },
          });
        },
      },
    );
  };

  const handlePhoneChallenge = (challengeData: ChallengeData) => {
    send({
      type: Events.challengeInitiated,
      payload: {
        challengeData,
      },
    });
  };

  return [requestBiometricChallenge, requestPhoneChallenge];
};

export default useBiometricLoginRetry;
