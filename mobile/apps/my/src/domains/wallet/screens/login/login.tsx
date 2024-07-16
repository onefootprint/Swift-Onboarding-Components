import { IcoFaceid24, IcoPhone24 } from '@onefootprint/icons';
import { ChallengeKind } from '@onefootprint/types';
import { Box, Container, SegmentedControl, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import useTranslation from '@/hooks/use-translation';
import type { ScreenProps } from '@/wallet/wallet.types';

import useSession from '../../hooks/use-session';
import Passkey from './components/passkey';
import Sms from './components/sms';

type LoginProps = ScreenProps<'Login'>;

const Login = ({ route, navigation }: LoginProps) => {
  const { t } = useTranslation('screens.login');
  const { canUseBiometric, identifier, identifiedAuthToken } = route.params;
  const shouldShowTabs = canUseBiometric;
  const [tab, setTab] = useState(canUseBiometric ? 'passkey' : 'sms');
  const session = useSession();
  const isApple = identifier.email === 'apple@onefootprint.com';

  const handleSuccess = (challengeKind: ChallengeKind) => (authToken: string) => {
    session.logIn(challengeKind, authToken, isApple);
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
            aria-label={t('aria-label')}
            marginBottom={7}
            onChange={setTab}
            options={[
              {
                IconComponent: IcoFaceid24,
                label: t('passkey.title'),
                value: 'passkey',
              },
              {
                IconComponent: IcoPhone24,
                label: t('sms.title'),
                value: 'sms',
              },
            ]}
            value={tab}
          />
        ) : null}
      </Box>
      {tab === 'sms' ? (
        <Sms
          isApple={isApple}
          identifier={identifier}
          identifiedAuthToken={identifiedAuthToken}
          onSuccess={handleSuccess(ChallengeKind.sms)}
        />
      ) : (
        <Passkey identifiedAuthToken={identifiedAuthToken} onSuccess={handleSuccess(ChallengeKind.biometric)} />
      )}
    </Container>
  );
};

export default Login;
