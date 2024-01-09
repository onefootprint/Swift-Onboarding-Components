import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { PinInput, Typography } from '@onefootprint/ui';
import React from 'react';

import type { ResendButtonProps } from './components/resend-button';
import ResendButton from './components/resend-button';
import Success from './components/success';
import Verifying from './components/verifying';

export type FormProps = ResendButtonProps & {
  title?: string;
  isVerifying?: boolean;
  isSuccess?: boolean;
  isPending?: boolean;
  hasError?: boolean;
  onComplete: (code: string) => void;
};

const Form = ({
  title,
  isPending,
  isVerifying,
  isSuccess,
  hasError,
  onComplete,
  resendDisabledUntil,
  onResend,
  isResendLoading,
}: FormProps) => {
  const { t } = useTranslation('identify.components.pin-verification');

  if (isSuccess) {
    return <Success />;
  }

  if (isVerifying) {
    return <Verifying />;
  }

  return (
    <StyledForm
      autoComplete="off"
      role="presentation"
      data-pending={!!isPending}
    >
      {title && (
        <Typography isPrivate variant="body-2" color="secondary" as="h3">
          {title}
        </Typography>
      )}
      <PinInput
        disabled={isPending}
        onComplete={onComplete}
        hasError={hasError}
        hint={hasError ? t('error') : undefined}
        testID="verification-form-pin-input"
        autoFocus
      />
      <ResendButton
        isResendLoading={isResendLoading}
        resendDisabledUntil={resendDisabledUntil}
        onResend={onResend}
      />
    </StyledForm>
  );
};

const StyledForm = styled.form`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[8]};
    justify-content: center;
    align-items: center;
    text-align: center;
  `}
`;

export default Form;
