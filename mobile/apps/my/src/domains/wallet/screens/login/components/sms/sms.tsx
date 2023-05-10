import {
  Box,
  DismissKeyboard,
  LinkButton,
  PinInput,
  Typography,
} from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

type SmsProps = {
  onSuccess?: () => void;
};

const Sms = ({ onSuccess }: SmsProps) => {
  const { t } = useTranslation('screens.login.sms');

  const handlePress = () => {
    onSuccess();
  };

  return (
    <DismissKeyboard>
      <Box center marginBottom={7}>
        <Typography variant="body-2">{t('instructions')}</Typography>
        <Typography variant="label-2">(•••) ••• ••02</Typography>
      </Box>
      <Box gap={7}>
        <PinInput onComplete={handlePress} />
        <LinkButton onPress={handlePress}>{t('cta')}</LinkButton>
      </Box>
    </DismissKeyboard>
  );
};

export default Sms;
