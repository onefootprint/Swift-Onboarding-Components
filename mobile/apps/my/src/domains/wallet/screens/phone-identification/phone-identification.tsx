import {
  Box,
  Container,
  DismissKeyboard,
  LinkButton,
  PinInput,
  Typography,
} from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';
import type { ScreenProps } from '@/wallet/wallet.types';

type PhoneIdentificationProps = ScreenProps<'PhoneIdentification'>;

const PhoneIdentification = ({ navigation }: PhoneIdentificationProps) => {
  const { t } = useTranslation('screens.phone-identification');

  const handlePress = () => {
    navigation.replace('MainTabs');
  };

  return (
    <Container>
      <Typography center variant="heading-3" marginTop={10} marginBottom={7}>
        {t('title')}
      </Typography>
      <DismissKeyboard>
        <Box gap={7}>
          <PinInput onComplete={value => alert(value)} />
          <LinkButton onPress={handlePress}>{t('sms.cta')}</LinkButton>
        </Box>
      </DismissKeyboard>
    </Container>
  );
};

export default PhoneIdentification;
