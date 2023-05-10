import { IcoFaceid24 } from '@onefootprint/icons';
import { Box, Button, Typography } from '@onefootprint/ui';
import React from 'react';

import useTranslation from '@/hooks/use-translation';

type PasskeyProps = {
  onSuccess?: () => void;
};

const Passkey = ({ onSuccess }: PasskeyProps) => {
  const { t } = useTranslation('screens.login.passkey');
  const isWaiting = false;
  const hasCta = true;
  const isRetry = false;

  const handlePress = () => {
    onSuccess();
  };

  return (
    <Box
      backgroundColor="secondary"
      borderRadius="default"
      center
      flexDirection="column"
      gap={7}
      padding={7}
      width="100%"
    >
      <Box
        backgroundColor="primary"
        borderRadius="default"
        center
        width={40}
        height={40}
      >
        <IcoFaceid24 />
      </Box>
      {isWaiting && (
        <Typography variant="label-3" color="secondary" marginBottom={6}>
          {t('loading')}
        </Typography>
      )}
      {hasCta && (
        <Button onPress={handlePress} size="compact" loading={false}>
          {isRetry ? t('cta-retry') : t('cta')}
        </Button>
      )}
    </Box>
  );
};

export default Passkey;
