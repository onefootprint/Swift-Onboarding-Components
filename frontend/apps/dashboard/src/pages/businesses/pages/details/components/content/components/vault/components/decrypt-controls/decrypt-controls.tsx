import { useTranslation } from '@onefootprint/hooks';
import { Box, Button, Portal, Tooltip } from '@onefootprint/ui';
import React from 'react';

import { WithEntityProps } from '@/business/components/with-entity';
import { HEADER_ACTIONS_SELECTOR, VAULT_FORM_ID } from '@/business/constants';
import useEntityVault from '@/businesses/hooks/use-entity-vault';

import ReasonDialog from './components/reason-dialog';
import useCanDecrypt from './hooks/use-can-decrypt';
import useDecryptControls from './hooks/use-decrypt-controls';

type DecryptControlsProps = WithEntityProps;

const DecryptControls = ({ entity }: DecryptControlsProps) => {
  const { allT, t } = useTranslation('pages.business.decrypt');
  const controls = useDecryptControls();
  const canDecrypt = useCanDecrypt(entity);
  const entityVault = useEntityVault(entity.id, entity);

  const handleSubmit = () => {
    controls.decrypt(entity.id, { onSuccess: entityVault.update });
  };

  return (
    <Portal selector={HEADER_ACTIONS_SELECTOR}>
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
            {allT('cancel')}
          </Button>
          <Button form={VAULT_FORM_ID} size="small" type="submit">
            {allT('next')}
          </Button>
        </Box>
      )}
      <ReasonDialog
        loading={controls.isLoading}
        onClose={controls.cancel}
        onSubmit={handleSubmit}
        open={controls.isOpen}
      />
    </Portal>
  );
};

export default DecryptControls;
