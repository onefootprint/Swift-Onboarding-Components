import styled, { css } from '@onefootprint/styled';
import { PinInput, Typography } from '@onefootprint/ui';
import React from 'react';

import type { ResendButtonProps } from '../resend-button';
import ResendButton from '../resend-button';
import Success from '../success';
import Verifying from '../verifying';

export type PinFormProps = Omit<ResendButtonProps, 'texts'> & {
  hasError?: boolean;
  isPending?: boolean;
  isSuccess?: boolean;
  isVerifying?: boolean;
  onComplete: (code: string) => void;
  title?: string;
  texts: ResendButtonProps['texts'] & {
    codeError: string;
    success: string;
    verifying: string;
  };
};

const PinForm = ({
  hasError,
  isPending,
  isResendLoading,
  isSuccess,
  isVerifying,
  onComplete,
  onResend,
  resendDisabledUntil,
  texts,
  title,
}: PinFormProps) => {
  if (isSuccess) return <Success text={texts.success} />;
  if (isVerifying) return <Verifying text={texts.verifying} />;

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
        hint={hasError ? texts.codeError : undefined}
        testID="verification-form-pin-input"
        autoFocus
      />
      <ResendButton
        isResendLoading={isResendLoading}
        onResend={onResend}
        resendDisabledUntil={resendDisabledUntil}
        texts={{
          resendCountDown: texts.resendCountDown,
          resendCta: texts.resendCta,
        }}
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

export default PinForm;
