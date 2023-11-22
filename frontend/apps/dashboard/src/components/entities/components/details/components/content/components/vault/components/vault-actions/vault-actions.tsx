import { useTranslation } from '@onefootprint/hooks';
import { Button, Portal, Stack, Tooltip } from '@onefootprint/ui';
import React from 'react';
import useEntityVaultWithTransforms from 'src/components/entities/hooks/use-entity-vault-with-transforms';

import type { WithEntityProps } from '@/entity/components/with-entity';
import {
  DECRYPT_VAULT_FORM_ID,
  EDIT_VAULT_FORM_ID,
  HEADER_ACTIONS_SELECTOR,
} from '@/entity/constants';

import Actions from './components/actions';
import ManualReview from './components/manual-review';
import ReasonDialog from './components/reason-dialog';
import useDecryptControls from './hooks/use-decrypt-controls';
import useEditControls from './hooks/use-edit-controls';

type VaultActionsControlsProps = WithEntityProps;

const VaultActionsControls = ({ entity }: VaultActionsControlsProps) => {
  const { allT, t } = useTranslation('pages.entity');
  const decryptControls = useDecryptControls();
  const editControls = useEditControls();
  const canDecrypt = !!entity.decryptableAttributes.length;
  const { data, update: updateVault } = useEntityVaultWithTransforms(
    entity.id,
    entity,
  );
  const entityVault = data?.vault;

  const handleDecryptSubmit = () => {
    decryptControls.decrypt(entity.id, entityVault, {
      onSuccess: newData => updateVault({ vault: newData, transforms: {} }),
    });
  };

  return (
    <Portal selector={HEADER_ACTIONS_SELECTOR}>
      {editControls.isIdle && decryptControls.isIdle && (
        <Tooltip disabled={canDecrypt} text={t('decrypt.not-allowed')}>
          <Stack gap={3} align="center">
            <Button
              disabled={!canDecrypt}
              onClick={decryptControls.start}
              size="small"
              variant="secondary"
            >
              {t('decrypt.start')}
            </Button>
            <ManualReview />
            <Actions />
          </Stack>
        </Tooltip>
      )}
      {(decryptControls.inProgress || editControls.inProgress) && (
        <Stack gap={3}>
          <Button
            size="small"
            variant="secondary"
            onClick={
              decryptControls.inProgress
                ? decryptControls.cancel
                : editControls.cancel
            }
          >
            {allT('cancel')}
          </Button>
          <Button
            form={
              decryptControls.inProgress
                ? DECRYPT_VAULT_FORM_ID
                : EDIT_VAULT_FORM_ID
            }
            size="small"
            type="submit"
          >
            {decryptControls.inProgress ? allT('next') : allT('save')}
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
