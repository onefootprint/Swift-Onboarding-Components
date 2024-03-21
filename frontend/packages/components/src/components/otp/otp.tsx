/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { HTMLAttributes } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useFootprint from '../../hooks/use-footprint';
import useRequest from '../../hooks/use-request';
import identifyAndStart from '../../queries/identify-and-start';
import PinInput from './components/pin-input';
import ResendButton from './components/resend-button';
import Title from './components/title';

export type OtpVerificationProps = {
  challengeData: {
    token: string;
    biometricChallengeJson?: string | null;
    challengeKind: string;
    challengeToken: string;
    scrubbedPhoneNumber?: string;
    timeBeforeRetryS?: number;
  };
  containerClassName?: string;
  onError: () => void;
  onResend: () => void;
  onSuccess: () => void;
  pinInputClassName?: string;
  pinInputContainerClassName?: string;
  resendButtonClassName?: string;
  titleClassName?: string;
} & HTMLAttributes<HTMLDivElement>;

const OtpVerification = ({
  challengeData: { challengeToken, scrubbedPhoneNumber, token },
  className,
  containerClassName,
  onError,
  onResend,
  onSuccess,
  pinInputClassName,
  pinInputContainerClassName,
  resendButtonClassName,
  titleClassName,
  ...props
}: OtpVerificationProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'otp' });
  const fp = useFootprint();
  const mutation = useRequest(identifyAndStart);

  const handleSubmit = async (value: string) => {
    mutation.mutate(
      {
        authToken: token,
        challengeResponse: value,
        challengeToken,
        scope: 'onboarding',
      },
      {
        onSuccess: response => {
          fp.updateAuthToken(response.authToken);
          fp.updateMissingRequirements(response.missingRequirements);
          onSuccess();
        },
      },
    );
  };

  return (
    <div {...props} className={cx('fp-otp-container', containerClassName)}>
      <Title className={titleClassName}>
        {t('title', {
          identifier: scrubbedPhoneNumber,
        })}
      </Title>
      <PinInput
        autoFocus
        className={pinInputClassName}
        containerClassName={pinInputContainerClassName}
        onComplete={handleSubmit}
      />
      <ResendButton
        className={resendButtonClassName}
        isLoading={mutation.loading}
      >
        {t('resend')}
      </ResendButton>
    </div>
  );
};

const OtpVerificationWithChallengeData = (props: OtpVerificationProps) => {
  const { context } = useFootprint();
  const challengeData = context.signupChallenge?.challengeData;
  if (!challengeData) {
    throw new Error('Challenge data not found');
  }

  return (
    <OtpVerification
      {...props}
      challengeData={{
        token: challengeData.token,
        biometricChallengeJson: challengeData.biometricChallengeJson,
        challengeKind: challengeData.challengeKind,
        challengeToken: challengeData.challengeToken,
        scrubbedPhoneNumber: challengeData.scrubbedPhoneNumber,
        timeBeforeRetryS: challengeData.timeBeforeRetryS,
      }}
    />
  );
};

export default OtpVerificationWithChallengeData;
