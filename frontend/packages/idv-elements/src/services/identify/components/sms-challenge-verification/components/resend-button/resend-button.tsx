import { useCountdown, useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { LinkButton, LoadingIndicator, Typography } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';

export type ResendButtonProps = {
  isResendLoading?: boolean;
  resendDisabledUntil?: Date;
  onResend: () => void;
};

const ResendButton = ({
  isResendLoading,
  resendDisabledUntil,
  onResend,
}: ResendButtonProps) => {
  const { t } = useTranslation(
    'components.sms-challenge-verification.resend-button',
  );
  const { setDate, countdown } = useCountdown();
  const [resendClicked, setResendClicked] = useState(false);
  const [internalDate, setInternalDate] = useState<Date | undefined>();

  const updateCountdown = () => {
    // No changes detected
    if (internalDate === resendDisabledUntil) {
      return;
    }

    // Remember this new date, reset the button clicked state
    setInternalDate(resendDisabledUntil);
    setResendClicked(false);

    // Don't disable anymore
    if (!resendDisabledUntil) {
      setDate(new Date());
      return;
    }

    // Set button to disabled until this new date
    setDate(resendDisabledUntil);
  };

  useEffect(() => {
    updateCountdown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resendDisabledUntil]);

  const handleClick = () => {
    setResendClicked(true);
    // Don't resend until the countdown is over
    if (countdown > 0) {
      return;
    }
    onResend();
  };

  return isResendLoading ? (
    <LoadingIndicator />
  ) : (
    <Container>
      <LinkButton
        disabled={resendClicked && countdown > 0}
        onClick={handleClick}
        size="compact"
        sx={{ marginBottom: 2 }}
      >
        {t('cta')}
      </LinkButton>
      {resendClicked && countdown > 0 && (
        <Typography variant="body-4" color="tertiary" sx={{ marginTop: 3 }}>
          {t('disabled', { seconds: countdown })}
        </Typography>
      )}
    </Container>
  );
};

const Container = styled.div`
  flex-direction: column;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default ResendButton;
