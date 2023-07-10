import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { PinInput, Typography } from '@onefootprint/ui';
import React from 'react';

import ResendButton, { ResendButtonProps } from './components/resend-button';
import Success from './components/success';
import Verifying from './components/verifying';

export type VerificationProps = ResendButtonProps & {
  title?: string;
  isVerifying?: boolean;
  isSuccess?: boolean;
  isPending?: boolean;
  hasError?: boolean;
  onComplete: (code: string) => void;
};

const Verification = ({
  title,
  isPending,
  isVerifying,
  isSuccess,
  hasError,
  onComplete,
  resendDisabledUntil,
  onResend,
  isResendLoading,
}: VerificationProps) => {
  const { t } = useTranslation('components.sms-challenge-verification');

  if (isSuccess) {
    return <Success />;
  }

  if (isVerifying) {
    return <Verifying />;
  }

  return (
    <Form autoComplete="off" role="presentation" data-pending={!!isPending}>
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

export default Verification;
