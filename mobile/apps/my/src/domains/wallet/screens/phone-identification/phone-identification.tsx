import { IcoFaceid24, IcoPhone24 } from '@onefootprint/icons';
import {
  Box,
  Container,
  DismissKeyboard,
  LinkButton,
  PinInput,
  SegmentedControl,
  Typography,
} from '@onefootprint/ui';
import React, { useState } from 'react';

import useTranslation from '@/hooks/use-translation';
import type { ScreenProps } from '@/wallet/wallet.types';

type PhoneIdentificationProps = ScreenProps<'PhoneIdentification'>;

const PhoneIdentification = ({ navigation }: PhoneIdentificationProps) => {
  const { t } = useTranslation('screens.phone-identification');
  const [tab, setTab] = useState('sms');

  const handlePress = () => {
    navigation.replace('MainTabs');
  };

  return (
    <Container center>
      <Typography variant="heading-3" marginVertical={7}>
        {t('title')}
      </Typography>
      <SegmentedControl
        aria-label="Identification method"
        value={tab}
        onChange={setTab}
        options={[
          {
            label: t('sms.title'),
            value: 'sms',
            IconComponent: IcoPhone24,
          },
          {
            label: t('biometric.title'),
            value: 'biometric',
            IconComponent: IcoFaceid24,
          },
        ]}
        marginBottom={7}
      />
      <DismissKeyboard>
        <Box center marginBottom={7}>
          <Typography variant="body-2">{t('sms.instructions')}</Typography>
          <Typography variant="label-2">(•••) ••• ••02</Typography>
        </Box>
        <Box gap={7}>
          <PinInput onComplete={handlePress} />
          <LinkButton onPress={handlePress}>{t('sms.cta')}</LinkButton>
        </Box>
      </DismissKeyboard>
    </Container>
  );
};

export default PhoneIdentification;
