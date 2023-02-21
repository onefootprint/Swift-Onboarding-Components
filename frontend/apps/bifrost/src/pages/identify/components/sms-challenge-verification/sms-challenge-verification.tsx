import { useTranslation } from '@onefootprint/hooks';
import { PinInput } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Loading from './components/loading';
import ResendButton, { ResendButtonProps } from './components/resend-button';
import Success from './components/success';

export type SmsChallengeVerificationProps = ResendButtonProps & {
  isLoading?: boolean;
  isSuccess?: boolean;
  hasError?: boolean;
  onComplete: (code: string) => void;
};

const SmsChallengeVerification = ({
  isLoading,
  isSuccess,
  hasError,
  onComplete,
  resendDisabledUntil,
  onResend,
}: SmsChallengeVerificationProps) => {
  const { t } = useTranslation('components.sms-challenge-verification');

  if (isSuccess) {
    return <Success />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Container>
      <PinInput
        onComplete={onComplete}
        hasError={hasError}
        hint={hasError ? t('error') : undefined}
        testID="sms-challenge-verification-pin-input"
      />
      <ResendButton
        resendDisabledUntil={resendDisabledUntil}
        onResend={onResend}
      />
    </Container>
  );
};

const Container = styled.div`
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
