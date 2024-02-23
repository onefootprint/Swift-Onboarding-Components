import { useCountdown } from '@onefootprint/hooks';
import { LinkButton, LoadingIndicator, Text } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

export type ResendButtonProps = {
  isResendLoading?: boolean;
  onResend: () => void;
  resendDisabledUntil?: Date;
  texts: {
    resendCta: string;
    resendCountDown: string;
  };
};

const ResendButton = ({
  isResendLoading,
  onResend,
  resendDisabledUntil,
  texts,
}: ResendButtonProps) => {
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
        sx={{ marginBottom: 2, marginTop: 4 }}
      >
        {texts.resendCta}
      </LinkButton>
      {resendClicked && countdown > 0 && (
        <Text variant="body-4" color="tertiary" sx={{ marginTop: 3 }}>
          {texts.resendCountDown.replace('{{seconds}}', String(countdown))}
        </Text>
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
