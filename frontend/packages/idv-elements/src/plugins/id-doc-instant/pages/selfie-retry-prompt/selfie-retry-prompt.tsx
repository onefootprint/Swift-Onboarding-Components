import { useTranslation } from '@onefootprint/hooks';
import { Box, Button } from '@onefootprint/ui';
import React from 'react';

import Error from '../../components/error/error';
import { useIdDocMachine } from '../../components/machine-provider';
import { ImageTypes } from '../../constants/image-types';

const SelfieRetryPrompt = () => {
  const [state, send] = useIdDocMachine();
  const { t } = useTranslation('pages.selfie-retry-prompt');

  const handleClick = () => {
    send({ type: 'startSelfieCapture' });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <Error
        imageType={ImageTypes.selfie}
        errors={state.context.errors || []}
      />
      <Button fullWidth onClick={handleClick}>
        {t('cta')}
      </Button>
    </Box>
  );
};

export default SelfieRetryPrompt;
