import { LinkButton, LoadingIndicator, Typography } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components/native';

import useCountdown from '@/hooks/use-countdown';
import useTranslation from '@/hooks/use-translation';

export type ResendButtonProps = {
  isResendLoading?: boolean;
  resendDisabledUntil?: Date;
  onResend: () => void;
};

const ResendButton = ({ isResendLoading, resendDisabledUntil, onResend }: ResendButtonProps) => {
  const { t } = useTranslation('pages.sms-challenge.resend-button');
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
    <ResendButtonContainer>
      <LinkButton disabled={resendClicked && countdown > 0} onPress={handleClick} size="compact">
        {t('cta')}
      </LinkButton>
      {resendClicked && countdown > 0 && (
        <Typography variant="body-3" color="tertiary">
          {t('disabled', {
            seconds: `${countdown} ${countdown > 1 ? 'seconds' : 'second'}`,
          })}
        </Typography>
      )}
    </ResendButtonContainer>
  );
};

const ResendButtonContainer = styled.View`
  ${({ theme }) => css`
    flex-direction: column;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[2]};
  `}
`;

export default ResendButton;
