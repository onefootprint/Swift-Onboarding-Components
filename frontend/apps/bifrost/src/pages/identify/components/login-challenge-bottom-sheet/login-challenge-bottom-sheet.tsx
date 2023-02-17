import {
  useIdentifyVerify,
  useLoginChallenge,
} from '@onefootprint/footprint-elements';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { ChallengeData, ChallengeKind, Identifier } from '@onefootprint/types';
import React from 'react';

import useIdentifyMachine, { Events } from '../../hooks/use-identify-machine';
import generateLoginDeviceResponse from '../../utils/biometric/login-challenge-response';
import ChallengePicker from './components/challenge-picker';

export type LoginChallengeBottomSheetProps = {
  identifier: Identifier;
  open: boolean;
  onClose?: () => void;
};

const LoginChallengeBottomSheet = ({
  identifier,
  open,
  onClose,
}: LoginChallengeBottomSheetProps) => {
  const [state, send] = useIdentifyMachine();
  const showRequestErrorToast = useRequestErrorToast();
  const loginChallengeMutation = useLoginChallenge();
  const identifyVerifyMutation = useIdentifyVerify();
  const isLoading =
    loginChallengeMutation.isLoading || identifyVerifyMutation.isLoading;
  const { device, tenantPk } = state.context;
  const deviceSupportsWebauthn =
    device.hasSupportForWebauthn && device.type === 'mobile';

  const hasIdentifier =
    Object.keys(identifier).includes('email') ||
    Object.keys(identifier).includes('phoneNumber');
  if (!deviceSupportsWebauthn || !hasIdentifier) {
    return null;
  }

  const handleBiometricChallenge = async (challengeData: ChallengeData) => {
    const { biometricChallengeJson, challengeToken } = challengeData;
    if (!biometricChallengeJson) {
      return;
    }
    const challengeResponse = await generateLoginDeviceResponse(
      biometricChallengeJson,
    );
    identifyVerifyMutation.mutate(
      { challengeResponse, challengeToken, tenantPk },
      {
        onSuccess: ({ authToken }) => {
          send({
            type: Events.biometricLoginSucceeded,
            payload: {
              authToken,
            },
          });
        },
        onError: error => {
          showRequestErrorToast(error);
          send({ type: Events.biometricLoginFailed });
        },
        onSettled: onClose,
      },
    );
  };

  const requestLoginChallenge = (preferredChallengeKind: ChallengeKind) => {
    loginChallengeMutation.mutate(
      {
        identifier,
        preferredChallengeKind,
      },
      {
        onSuccess({ challengeData }) {
          const { challengeKind } = challengeData;
          if (challengeKind === ChallengeKind.sms) {
            send({
              type: Events.smsChallengeInitiated,
              payload: {
                challengeData,
              },
            });
          } else {
            handleBiometricChallenge(challengeData);
          }
        },
        onError: showRequestErrorToast,
        onSettled: onClose,
      },
    );
  };

  // If user picks sms challenge, we initiate an sms challenge and
  // notify the state machine
  const handleSelectSms = () => {
    requestLoginChallenge(ChallengeKind.sms);
  };

  // If user picks biometric challenge, we internally handle the biometric flow
  // and notify the state machine when the challenge is successfully completed
  const handleSelectBiometric = () => {
    requestLoginChallenge(ChallengeKind.biometric);
  };

  // On mobile devices that support webauthn, if the user vault has multiple
  // challenge kinds available, we give the user a choice
  return (
    <ChallengePicker
      open={open}
      isLoading={isLoading}
      onClose={onClose}
      onSelectSms={handleSelectSms}
      onSelectBiometric={handleSelectBiometric}
    />
  );
};

export default LoginChallengeBottomSheet;
