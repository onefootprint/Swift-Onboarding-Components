import { useCountdown } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { Button, Stack, Text, useToast } from '@onefootprint/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEffectOnce } from 'usehooks-ts';

import { useD2PSms } from '../../../../hooks/api';
import { Logger } from '../../../../utils/logger';

const COUNTER_SECONDS = 10;

export type SmsButtonWithCountdownProps = {
  authToken?: string;
  url?: string;
};

const SmsButtonWithCountdown = ({
  url,
  authToken,
}: SmsButtonWithCountdownProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'transfer.components.sms-button-with-countdown',
  });
  const { countdown, setSeconds } = useCountdown({
    onCompleted: () => setIsDisabled(false),
  });
  const toast = useToast();
  const d2pSmsMutation = useD2PSms();
  const { isLoading } = d2pSmsMutation;
  const [isDisabled, setIsDisabled] = useState(true);
  const sendCount = useRef(0);
  const isResend = sendCount.current > 1;

  const handleSendError = (error: unknown) => {
    setIsDisabled(false);
    setSeconds(0);
    Logger.error('Error when sending SMS on qr register page', {
      error: getErrorMessage(error),
    });
    toast.show({
      title: t('error.title'),
      description: t('error.description'),
      variant: 'error',
    });
  };

  const disableAndStartCountdown = () => {
    setIsDisabled(true);
    setSeconds(COUNTER_SECONDS);
  };

  useEffectOnce(() => {
    disableAndStartCountdown();
  });

  useEffect(() => {
    if (url && authToken && sendCount.current === 0) {
      sendCount.current += 1;
      d2pSmsMutation.mutate({ authToken, url }, { onError: handleSendError });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, authToken]);

  const handleResend = () => {
    if (isLoading || !authToken || !url) {
      return;
    }
    sendCount.current += 1;
    d2pSmsMutation.mutate(
      { authToken, url },
      {
        onSuccess: () => {
          disableAndStartCountdown();
          toast.show({
            title: t('resend-success.title'),
            description: t('resend-success.description'),
          });
        },
        onError: handleSendError,
      },
    );
  };

  return (
    <Stack direction="column" align="center" gap={3} marginTop={2}>
      <Button
        variant="secondary"
        fullWidth
        disabled={isDisabled}
        loading={isResend && isLoading}
        onClick={isDisabled ? undefined : handleResend}
        size="large"
        data-dd-action-name="transfer:resend-sms"
      >
        {t('cta')}
      </Button>
      {countdown > 0 && (
        <Text variant="body-4" color="quaternary">
          {t('subtitleWithCount', {
            count: countdown,
          })}
        </Text>
      )}
    </Stack>
  );
};

export default SmsButtonWithCountdown;
