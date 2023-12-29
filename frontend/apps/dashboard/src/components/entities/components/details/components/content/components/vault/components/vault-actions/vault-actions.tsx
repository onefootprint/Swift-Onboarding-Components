import { useTranslation } from '@onefootprint/hooks';
import { EntityStatus } from '@onefootprint/types';
import { Button, Portal, Stack, Tooltip } from '@onefootprint/ui';
import { SplitButton } from '@onefootprint/ui/src/components';
import React from 'react';
import useEntityVaultWithTransforms from 'src/components/entities/hooks/use-entity-vault-with-transforms';
import { useEffectOnce } from 'usehooks-ts';

import type { WithEntityProps } from '@/entity/components/with-entity';
import {
  DECRYPT_VAULT_FORM_ID,
  EDIT_VAULT_FORM_ID,
  HEADER_ACTIONS_SELECTOR,
} from '@/entity/constants';
import useCurrentEntity from '@/entity/hooks/use-current-entity';

import Actions from './components/actions';
import Cmdk from './components/cmdk';
import ManualReview from './components/manual-review';
import ReasonDialog from './components/reason-dialog';
import useDecryptControls from './hooks/use-decrypt-controls';
import useEditControls from './hooks/use-edit-controls';

export type VaultActionsControlsProps = WithEntityProps;

const VaultActionsControls = ({ entity }: VaultActionsControlsProps) => {
  const { allT, t } = useTranslation('pages.entity');
  const { data: entityData } = useCurrentEntity();

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

  const handleKeyDown = (e: { key: string; preventDefault: () => void }) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      decryptControls.cancel();
      editControls.cancel();
    }
  };

  useEffectOnce(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  const shouldRenderManualReview =
    entityData && entityData.status !== EntityStatus.none;

  return (
    <Portal selector={HEADER_ACTIONS_SELECTOR}>
      {editControls.isIdle && decryptControls.isIdle && (
        <Stack gap={3} align="center">
          <Tooltip disabled={canDecrypt} text={t('decrypt.not-allowed')}>
            <SplitButton
              disabled={!canDecrypt}
              variant="secondary"
              options={[
                {
                  label: t('decrypt.start'),
                  value: 'start',
                  onSelect: decryptControls.start,
                },
                {
                  label: t('decrypt.start-all'),
                  value: 'start-all',
                  onSelect: () =>
                    decryptControls.submitAllFields(
                      entity.decryptableAttributes,
                    ),
                },
              ]}
            />
          </Tooltip>
          {shouldRenderManualReview && (
            <ManualReview status={entityData.status} />
          )}
          <Actions />
        </Stack>
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
            loading={!!editControls.isLoading}
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
      <Cmdk entity={entity} />
    </Portal>
  );
};

export default VaultActionsControls;
