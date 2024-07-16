import { IcoFaceid24 } from '@onefootprint/icons';
import { Box, Button } from '@onefootprint/ui';
import React, { useState } from 'react';

import useTranslation from '@/hooks/use-translation';

import useLoginWithPasskey from './hooks/use-login-with-passkey';
import hasUserCancelled from './utils/has-user-canceled-passkey';

type PasskeyProps = {
  identifiedAuthToken: string;
  onSuccess: (authToken: string) => void;
};

const Passkey = ({ identifiedAuthToken, onSuccess }: PasskeyProps) => {
  const { isLoading, mutate } = useLoginWithPasskey();
  const [isRetry, setRetry] = useState(false);
  const { t } = useTranslation('screens.login.passkey');

  const handlePress = () => {
    mutate(identifiedAuthToken, {
      onSuccess: ({ authToken }) => {
        onSuccess(authToken);
      },
      onError: (error: unknown) => {
        if (hasUserCancelled(error)) return;
        setRetry(true);
      },
    });
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
      <Box backgroundColor="primary" borderRadius="default" center height={40} width={40}>
        <IcoFaceid24 />
      </Box>
      <Button onPress={handlePress} loading={isLoading}>
        {isRetry ? t('cta-retry') : t('cta')}
      </Button>
    </Box>
  );
};

export default Passkey;
