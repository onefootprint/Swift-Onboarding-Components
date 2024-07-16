import { Box, DismissKeyboard, LinkButton, PinInput, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

import Success from './components/success';
import Verifying from './components/verifying';
import useVerifyChallenge from './hooks/use-verify-challenge';

type ContentProps = {
  isApple: boolean;
  challengeToken: string;
  onSuccess: (authToken: string) => void;
  phoneNumber: string;
};

const Content = ({ isApple, challengeToken, onSuccess, phoneNumber }: ContentProps) => {
  const { t } = useTranslation('screens.login.sms');
  const { isLoading, isSuccess, mutate } = useVerifyChallenge();

  const handleComplete = (pin: string) => {
    mutate(
      {
        isApple,
        challengeResponse: pin,
        challengeToken,
      },
      {
        onSuccess: ({ authToken }) => onSuccess(authToken),
      },
    );
  };

  if (isSuccess) {
    return <Success />;
  }

  if (isLoading) {
    return <Verifying />;
  }

  return (
    <DismissKeyboard>
      <Box center marginBottom={7}>
        <Typography variant="body-2">{t('instructions')}</Typography>
        <Typography variant="body-2">{phoneNumber}</Typography>
      </Box>
      <Box gap={7}>
        <PinInput onComplete={handleComplete} autoFocus />
        <LinkButton>{t('cta')}</LinkButton>
      </Box>
    </DismissKeyboard>
  );
};

export default Content;
