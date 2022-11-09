import {
  useIdentify,
  useIdentifyVerify,
} from '@onefootprint/footprint-elements';
import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import {
  ChallengeData,
  ChallengeKind,
  IdentifyResponse,
  IdentifyVerifyResponse,
  UserData,
  UserDataAttribute,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useState } from 'react';
import { Events } from 'src/utils/state-machine/identify/types';

import generateLoginDeviceResponse from '../../../../utils/biometric/login-challenge-response';
import useIdentifyMachine from '../../hooks/use-identify-machine';
import ChallengePicker from './components/challenge-picker';
import EmailIdentificationForm from './components/email-identification-form';
import EmailIdentificationHeader from './components/email-identification-header';

type FormData = Required<Pick<UserData, UserDataAttribute.email>>;

const EmailIdentification = () => {
  const { t } = useTranslation('pages.email-identification');
  const identifyMutation = useIdentify();
  const identifyVerifyMutation = useIdentifyVerify();

  const showRequestErrorToast = useRequestErrorToast();
  const [state, send] = useIdentifyMachine();
  const {
    context: { device, identifyType },
  } = state;

  const deviceSupportsWebauthn =
    device.hasSupportForWebauthn && device.type === 'mobile';
  const [challengePickerVisible, setChallengePickerVisible] = useState(false);
  const [formData, setFormData] = useState({ [UserDataAttribute.email]: '' });
  const isLoading =
    identifyMutation.isLoading || identifyVerifyMutation.isLoading;

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
      { challengeResponse, challengeToken },
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
          send({ type: Events.biometricLoginFailed });
        },
      },
    );
  };

  const identifyWithChallenge = (
    email: string,
    preferredChallengeKind: ChallengeKind,
  ) => {
    identifyMutation.mutate(
      {
        identifier: { email },
        preferredChallengeKind,
        identifyType,
      },
      {
        onSuccess({ userFound, challengeData }) {
          send({
            type: Events.emailIdentificationCompleted,
            payload: {
              userFound,
              challengeData,
              email,
            },
          });

          if (challengeData?.challengeKind === ChallengeKind.biometric) {
            handleBiometricChallenge(challengeData);
          }
        },
        onError: showRequestErrorToast,
      },
    );
  };

  const onSubmit = (data: FormData) => {
    setFormData(data);

    identifyMutation.mutate(
      { identifier: { email: data.email }, identifyType },
      {
        onSuccess({ userFound, availableChallengeKinds }: IdentifyResponse) {
          if (!userFound) {
            send({
              type: Events.emailIdentificationCompleted,
              payload: {
                userFound,
                email: data.email,
              },
            });
            return;
          }

          // Device doesn't support biometrics or the user account doesn't have biometric creds registered:
          // No need to show the challenge picker, just initiate phone challenge
          const biometricChallengeAllowed = availableChallengeKinds
            ? availableChallengeKinds.includes(ChallengeKind.biometric)
            : false;
          if (!deviceSupportsWebauthn || !biometricChallengeAllowed) {
            identifyWithChallenge(data.email, ChallengeKind.sms);
            return;
          }

          // We need to ask the user what challenge kind they prefer
          setChallengePickerVisible(true);
        },
        onError: showRequestErrorToast,
      },
    );
  };

  const handleSelectSms = () => {
    identifyWithChallenge(formData.email, ChallengeKind.sms);
  };

  const handleSelectBiometric = () => {
    identifyWithChallenge(formData.email, ChallengeKind.biometric);
  };

  const handleChallengePickerClose = () => {
    setChallengePickerVisible(false);
  };

  return (
    <>
      <EmailIdentificationHeader />
      <EmailIdentificationForm onSubmit={onSubmit} isLoading={isLoading} />
      <Typography
        color="tertiary"
        sx={{ textAlign: 'center' }}
        variant="caption-1"
      >
        {t('terms.label')}&nbsp;
        <Link
          href="https://www.onefootprint.com/terms-of-service"
          target="_blank"
          rel="noreferrer noopener"
        >
          {t('terms.link')}
        </Link>
      </Typography>
      {deviceSupportsWebauthn && (
        <ChallengePicker
          open={challengePickerVisible}
          onClose={handleChallengePickerClose}
          onSelectSms={handleSelectSms}
          onSelectBiometric={handleSelectBiometric}
        />
      )}
    </>
  );
};

export default EmailIdentification;
