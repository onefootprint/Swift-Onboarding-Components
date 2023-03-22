import { useTranslation } from '@onefootprint/hooks';
import { Box, Button, Tooltip } from '@onefootprint/ui';
import React from 'react';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';
import useUserVault from 'src/pages/users/pages/user-details/hooks/use-user-vault';

import ReasonDialog from './components/reason-dialog';
import useCanDecrypt from './hooks/use-can-decrypt';
import useDecryptControls from './hooks/use-decrypt-controls/use-decrypt-controls';

const Decrypt = () => {
  const { t } = useTranslation('pages.user-details.decrypt.controls');
  const controls = useDecryptControls();
  const canDecrypt = useCanDecrypt();
  const userId = useUserId();
  const userVault = useUserVault(userId);

  const handleSubmit = () => {
    controls.decrypt(userId, {
      onSuccess: vault => {
        userVault.update(vault);
      },
    });
  };

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
      <ReasonDialog
        loading={controls.isLoading}
        onClose={controls.cancel}
        onSubmit={handleSubmit}
        open={controls.isOpen}
      />
    </>
  );
};

export default Decrypt;
