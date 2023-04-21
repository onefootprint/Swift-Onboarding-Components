import { useTranslation } from '@onefootprint/hooks';
import { PinInput, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import ResendButton, { ResendButtonProps } from './components/resend-button';
import Success from './components/success';
import Verifying from './components/verifying';

export type SmsChallengeVerificationProps = ResendButtonProps & {
  title?: string;
  isVerifying?: boolean;
  isSuccess?: boolean;
  hasError?: boolean;
  onComplete: (code: string) => void;
};

const SmsChallengeVerification = ({
  title,
  isVerifying,
  isSuccess,
  hasError,
  onComplete,
  resendDisabledUntil,
  onResend,
  isResendLoading,
}: SmsChallengeVerificationProps) => {
  const { t } = useTranslation('components.sms-challenge-verification');

  if (isSuccess) {
    return <Success />;
  }

  if (isVerifying) {
    return <Verifying />;
  }

  return (
    <Form autoComplete="off" role="presentation">
      {title && (
        <Typography variant="body-2" color="secondary" as="h3">
          {title}
        </Typography>
      )}
      <PinInput
        onComplete={onComplete}
        hasError={hasError}
        hint={hasError ? t('error') : undefined}
        testID="sms-challenge-verification-pin-input"
      />
      <ResendButton
        isResendLoading={isResendLoading}
        resendDisabledUntil={resendDisabledUntil}
        onResend={onResend}
      />
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[8]};
    justify-content: center;
    align-items: center;
    text-align: center;
  `}
`;

export default SmsChallengeVerification;
