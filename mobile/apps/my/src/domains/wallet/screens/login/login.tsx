import {
  Box,
  Button,
  Container,
  DismissKeyboard,
  TextInput,
  Typography,
} from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';
import type { ScreenProps } from '@/wallet/wallet.types';

type LoginProps = ScreenProps<'Login'>;

const Login = ({ navigation }: LoginProps) => {
  const { t } = useTranslation('screens.login');

  const handlePress = () => {
    navigation.replace('MainTabs');
  };

  return (
    <Container>
      <Box center marginBottom={8} marginTop={10}>
        <Typography variant="heading-3" marginBottom={3}>
          {t('title')}
        </Typography>
        <Typography variant="body-2">{t('subtitle')}</Typography>
      </Box>
      <DismissKeyboard>
        <Box gap={7}>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            autoFocus
            blurOnSubmit
            inputMode="email"
            label="Email"
            placeholder="your.email@email.com"
            returnKeyType="send"
            spellCheck={false}
          />
          <Button onPress={handlePress}>{t('form.cta')}</Button>
        </Box>
      </DismissKeyboard>
    </Container>
  );
};

export default Login;
