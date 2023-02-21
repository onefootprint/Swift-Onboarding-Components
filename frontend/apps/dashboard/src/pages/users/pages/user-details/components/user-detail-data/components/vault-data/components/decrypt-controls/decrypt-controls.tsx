import { useTranslation } from '@onefootprint/hooks';
import { Box, Button, Tooltip } from '@onefootprint/ui';
import React from 'react';

import DecryptReasonDialog from './components/decrypt-reason-dialog';
import useCanDecrypt from './hooks/use-can-decrypt';
import useDecryptControls from './hooks/use-decrypt-controls';

const DecryptControls = () => {
  const { t } = useTranslation('pages.user-details.decrypt.controls');
  const controls = useDecryptControls();
  const canDecrypt = useCanDecrypt();

  return (
    <>
      {controls.isIdle && (
        <Tooltip disabled={canDecrypt} text={t('not-allowed')}>
          <Box>
            <Button
              disabled={!canDecrypt}
              onClick={controls.start}
              size="small"
              variant="secondary"
            >
              {t('start')}
            </Button>
          </Box>
        </Tooltip>
      )}
      {controls.inProgress && (
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Button size="small" variant="secondary" onClick={controls.cancel}>
            {t('cancel')}
          </Button>
          <Button form="decrypt-form" size="small" type="submit">
            {t('next')}
          </Button>
        </Box>
      )}
      <DecryptReasonDialog
        loading={controls.isLoading}
        open={controls.isOpen}
        onClose={controls.cancel}
      />
    </>
  );
};

export default DecryptControls;
