import { useCountdown } from '@onefootprint/hooks';
import {
  AnimatedLoadingSpinner,
  LinkButton,
  Stack,
  Text,
} from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';

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
    <AnimatedLoadingSpinner animationStart />
  ) : (
    <Stack
      align="center"
      direction="column"
      justify="center"
      gap={2}
      marginTop={5}
    >
      <LinkButton
        disabled={resendClicked && countdown > 0}
        onClick={handleClick}
      >
        {texts.resendCta}
      </LinkButton>
      {resendClicked && countdown > 0 && (
        <Text variant="body-4" color="tertiary" marginTop={3}>
          {texts.resendCountDown.replace('{{seconds}}', String(countdown))}
        </Text>
      )}
    </Stack>
  );
};

export default ResendButton;
