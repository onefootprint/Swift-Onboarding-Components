import { useTranslation } from '@onefootprint/hooks';
import { IcoSmartphone24 } from '@onefootprint/icons';
import { Button, Stack } from '@onefootprint/ui';
import React from 'react';

import { useAuthMachine } from '../../state';
import type { HeaderProps } from '../../types';
import Biometric from '../biometric';

type StepPassKeyProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const PasskeyChallenge = ({ children, Header }: StepPassKeyProps) => {
  const { t } = useTranslation('pages.auth.passkey-challenge');
  const [, send] = useAuthMachine();

  const handleChangeChallenge = () => {
    send({ type: 'changeChallengeToSms' });
  };

  return (
    <>
      <Stack
        direction="column"
        gap={7}
        align="center"
        justify="center"
        backgroundColor="primary"
      >
        <Header title={t('title')} />
        <Stack
          align="center"
          direction="column"
          gap={5}
          justify="center"
          width="100%"
        >
          <Biometric />
          <Button
            fullWidth
            onClick={handleChangeChallenge}
            prefixIcon={IcoSmartphone24}
            variant="secondary"
          >
            {t('login-with-sms')}
          </Button>
        </Stack>
      </Stack>
      {children}
    </>
  );
};

export default PasskeyChallenge;
