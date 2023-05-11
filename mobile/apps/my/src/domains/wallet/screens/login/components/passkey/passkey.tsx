import { IcoFaceid24 } from '@onefootprint/icons';
import { Identifier } from '@onefootprint/types';
import { Box, Button } from '@onefootprint/ui';
import React, { useState } from 'react';

import useTranslation from '@/hooks/use-translation';

import useAuthenticateWithPasskeys from './hooks/use-authenticate-with-passkeys';
import hasUserCancelled from './utils/has-user-canceled-passkey';

type PasskeyProps = {
  identifier: Identifier;
  onSuccess?: (authToken: string) => void;
};

const Passkey = ({ identifier, onSuccess }: PasskeyProps) => {
  const mutation = useAuthenticateWithPasskeys();
  const [isRetry, setRetry] = useState(false);
  const { t } = useTranslation('screens.login.passkey');

  const handlePress = () => {
    mutation.mutate(identifier, {
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
      <Box
        backgroundColor="primary"
        borderRadius="default"
        center
        height={40}
        width={40}
      >
        <IcoFaceid24 />
      </Box>
      <Button onPress={handlePress} size="compact" loading={mutation.isLoading}>
        {isRetry ? t('cta-retry') : t('cta')}
      </Button>
    </Box>
  );
};

export default Passkey;
