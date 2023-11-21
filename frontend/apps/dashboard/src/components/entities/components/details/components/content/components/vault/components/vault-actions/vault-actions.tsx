import { useTranslation } from '@onefootprint/hooks';
import { Button, Portal, Stack, Tooltip } from '@onefootprint/ui';
import React from 'react';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import type { WithEntityProps } from '@/entity/components/with-entity';
import {
  DECRYPT_VAULT_FORM_ID,
  HEADER_ACTIONS_SELECTOR,
} from '@/entity/constants';

import Actions from './components/actions';
import ManualReview from './components/manual-review';
import ReasonDialog from './components/reason-dialog';
import useDecryptControls from './hooks/use-decrypt-controls';

type VaultActionsControlsProps = WithEntityProps;

const VaultActionsControls = ({ entity }: VaultActionsControlsProps) => {
  const { allT, t } = useTranslation('pages.entity.decrypt');
  const decryptControls = useDecryptControls();
  const canDecrypt = !!entity.decryptableAttributes.length;
  const entityVault = useEntityVault(entity.id, entity);

  const handleDecryptSubmit = () => {
    decryptControls.decrypt(entity.id, entityVault.data, {
      onSuccess: entityVault.update,
    });
  };

  return (
    <Portal selector={HEADER_ACTIONS_SELECTOR}>
      {decryptControls.isIdle && (
        <Tooltip disabled={canDecrypt} text={t('not-allowed')}>
          <Stack gap={3} align="center">
            <Button
              disabled={!canDecrypt}
              onClick={decryptControls.start}
              size="small"
              variant="secondary"
            >
              {t('start')}
            </Button>
            <ManualReview />
            <Actions />
          </Stack>
        </Tooltip>
      )}
      {decryptControls.inProgress && (
        <Stack gap={3}>
          <Button
            size="small"
            variant="secondary"
            onClick={decryptControls.cancel}
          >
            {allT('cancel')}
          </Button>
          <Button form={DECRYPT_VAULT_FORM_ID} size="small" type="submit">
            {allT('next')}
          </Button>
        </Stack>
      )}
      <ReasonDialog
        loading={decryptControls.isLoading}
        onClose={decryptControls.cancel}
        onSubmit={handleDecryptSubmit}
        open={decryptControls.isOpen}
      />
    </Portal>
  );
};

export default VaultActionsControls;
