import { IcoFaceid24, IcoPhone24 } from '@onefootprint/icons';
import { Box, Container, SegmentedControl, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import useTranslation from '@/hooks/use-translation';
import type { ScreenProps } from '@/wallet/wallet.types';

import Passkey from './components/passkey';
import Sms from './components/sms';

type LoginProps = ScreenProps<'Login'>;

const Login = ({ route, navigation }: LoginProps) => {
  const { t } = useTranslation('screens.login');
  const { canUseBiometric } = route.params;
  const shouldShowTabs = canUseBiometric;
  const [tab, setTab] = useState(canUseBiometric ? 'passkey' : 'sms');

  const handleSuccess = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <Container>
      <Box center>
        <Typography variant="heading-3" marginVertical={7}>
          {t('title')}
        </Typography>
        {shouldShowTabs ? (
          <SegmentedControl
            aria-label="Identification method"
            value={tab}
            onChange={setTab}
            options={[
              {
                label: t('passkey.title'),
                value: 'passkey',
                IconComponent: IcoFaceid24,
              },
              {
                label: t('sms.title'),
                value: 'sms',
                IconComponent: IcoPhone24,
              },
            ]}
            marginBottom={7}
          />
        ) : null}
      </Box>
      {tab === 'sms' ? (
        <Sms onSuccess={handleSuccess} />
      ) : (
        <Passkey onSuccess={handleSuccess} />
      )}
    </Container>
  );
};

export default Login;
