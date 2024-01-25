import { IcoSmartphone24 } from '@onefootprint/icons';
import { Button, Stack } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { HeaderProps } from '@/src/types';

import Biometric from '../biometric';

type StepPassKeyProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
  onSmsButtonClick: React.MouseEventHandler<HTMLButtonElement>;
};

const PasskeyChallenge = ({
  children,
  Header,
  onSmsButtonClick,
}: StepPassKeyProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'passkey-challenge',
  });

  return (
    <>
      <Stack
        align="center"
        backgroundColor="primary"
        direction="column"
        gap={7}
        justify="center"
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
            onClick={onSmsButtonClick}
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
