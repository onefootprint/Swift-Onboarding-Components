import { useTranslation } from 'hooks';
import React from 'react';
import { Box, Button } from 'ui';

import { useDecryptMachine } from '../../../../../../utils/decrypt-state-machine';
import DecryptReasonDialog from '../decrypt-reason-dialog';

const DecryptControls = () => {
  const { t } = useTranslation('pages.user-details.decrypt.controls');
  const [state, send] = useDecryptMachine();

  return (
    <>
      {state.matches('IDLE') && (
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            send('STARTED');
          }}
        >
          {t('start')}
        </Button>
      )}
      {(state.matches('SELECTING_FIELDS') ||
        state.matches('CONFIRMING_REASON') ||
        state.matches('DECRYPTING')) && (
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              send('CANCELLED');
            }}
          >
            {t('cancel')}
          </Button>
          <Button form="decrypt-form" size="small" type="submit">
            {t('next')}
          </Button>
        </Box>
      )}
      <DecryptReasonDialog
        loading={state.matches('DECRYPTING')}
        open={state.matches('CONFIRMING_REASON') || state.matches('DECRYPTING')}
        onClose={() => {
          send('CANCELLED');
        }}
      />
    </>
  );
};

export default DecryptControls;
