import { useTranslation } from '@onefootprint/hooks';
import { Box, Button, Tooltip } from '@onefootprint/ui';
import React from 'react';
import usePermissions from 'src/hooks/use-permissions';

import { Event, State } from '../../../../../../utils/decrypt-state-machine';
import { useDecryptMachine } from '../../../../../decrypt-machine-provider';
import DecryptReasonDialog from '../decrypt-reason-dialog';

const DecryptControls = () => {
  const { t } = useTranslation('pages.user-details.decrypt.controls');
  const { canDecrypt } = usePermissions();
  const [state, send] = useDecryptMachine();
  const decryptReasonDialogOpen =
    state.matches(State.confirmingReason) || state.matches(State.decrypting);
  const decryptSelectionInProgress =
    state.matches(State.selectingFields) ||
    state.matches(State.confirmingReason) ||
    state.matches(State.decrypting);
  const decryptIdle = state.matches(State.idle);
  const decryptLoading = state.matches(State.decrypting);

  const handleStart = () => {
    send(Event.started);
  };

  const handleCancel = () => {
    send(Event.canceled);
  };

  return (
    <>
      {decryptIdle && (
        <Tooltip disabled={canDecrypt} text={t('not-allowed')}>
          <Box>
            <Button
              disabled={!canDecrypt}
              onClick={handleStart}
              size="small"
              variant="secondary"
            >
              {t('start')}
            </Button>
          </Box>
        </Tooltip>
      )}
      {decryptSelectionInProgress && (
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Button size="small" variant="secondary" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button form="decrypt-form" size="small" type="submit">
            {t('next')}
          </Button>
        </Box>
      )}
      <DecryptReasonDialog
        loading={decryptLoading}
        open={decryptReasonDialogOpen}
        onClose={handleCancel}
      />
    </>
  );
};

export default DecryptControls;
