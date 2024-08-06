import { EntityStatus, RoleScopeKind } from '@onefootprint/types';
import { Button, Portal, SplitButton, Stack, Tooltip } from '@onefootprint/ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import { useEventListener } from 'usehooks-ts';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import type { WithEntityProps } from '@/entity/components/with-entity';
import { DECRYPT_VAULT_FORM_ID, EDIT_VAULT_FORM_ID, HEADER_ACTIONS_SELECTOR } from '@/entity/constants';
import useCurrentEntity from '@/entity/hooks/use-current-entity';

import useEntitySeqno from '@/entity/hooks/use-entity-seqno';
import Actions from './components/actions';
import Cmdk from './components/cmdk';
import ManualReview from './components/manual-review';
import ReasonDialog from './components/reason-dialog';
import useDecryptControls from './hooks/use-decrypt-controls';
import useEditControls from './hooks/use-edit-controls';

export type VaultActionsControlsProps = WithEntityProps;

const VaultActionsControls = ({ entity }: VaultActionsControlsProps) => {
  const { t } = useTranslation('common');
  const { data: entityData } = useCurrentEntity();
  const isViewingHistorical = !!useEntitySeqno();
  const { data, update: updateVault } = useEntityVault(entity.id, entity);
  const entityVault = data?.vault;

  const decryptControls = useDecryptControls();
  const editControls = useEditControls();
  const isIdle = decryptControls.isIdle && editControls.isIdle;
  const isInProgress = decryptControls.inProgress || editControls.inProgress;
  const canDecrypt = !!entity.decryptableAttributes.length;

  const handleKeyDown = (e: { key: string; preventDefault: () => void }) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      decryptControls.cancel();
      editControls.cancel();
    }
  };
  const documentRef = useRef<Document>(document);
  useEventListener('keydown', handleKeyDown, documentRef);

  const handleDecryptSubmit = () => {
    decryptControls.decrypt(entity.id, entityVault, {
      onSuccess: newData => updateVault({ vault: newData, transforms: {}, dataKinds: {} }), // Update vault will take care of this using the already existing transforms and dataKinds
    });
  };

  const renderIdleControls = () => {
    const shouldRenderManualReview = entityData && entityData.status !== EntityStatus.none;
    return (
      <Stack gap={3} align="center">
        {!isViewingHistorical && (
          <Tooltip disabled={canDecrypt} text={t('pages.entity.decrypt.not-allowed')}>
            <SplitButton
              disabled={!canDecrypt}
              variant="secondary"
              options={[
                {
                  label: t('pages.entity.decrypt.start'),
                  value: 'start',
                  onSelect: decryptControls.start,
                },
                {
                  label: t('pages.entity.decrypt.start-all'),
                  value: 'start-all',
                  onSelect: () => decryptControls.submitAllFields(),
                },
              ]}
            />
          </Tooltip>
        )}
        {shouldRenderManualReview && (
          <PermissionGate
            scopeKind={RoleScopeKind.manualReview}
            fallbackText={t('pages.entity.manual-review-not-allowed')}
          >
            <ManualReview status={entityData.status} kind={entityData.kind} />
          </PermissionGate>
        )}
        <Actions />
      </Stack>
    );
  };

  const renderInProgressControls = () => (
    <Stack gap={3}>
      <Button variant="secondary" onClick={decryptControls.inProgress ? decryptControls.cancel : editControls.cancel}>
        {t('cancel')}
      </Button>
      <Button
        form={decryptControls.inProgress ? DECRYPT_VAULT_FORM_ID : EDIT_VAULT_FORM_ID}
        type="submit"
        loading={!!editControls.isLoading}
      >
        {decryptControls.inProgress ? t('next') : t('save')}
      </Button>
    </Stack>
  );

  const renderDialogsAndCmdk = () => (
    <>
      <ReasonDialog
        loading={decryptControls.isLoading}
        onClose={decryptControls.cancel}
        onSubmit={handleDecryptSubmit}
        open={decryptControls.isOpen}
      />
      <Cmdk entity={entity} />
    </>
  );

  return (
    <Portal selector={HEADER_ACTIONS_SELECTOR}>
      {isIdle && renderIdleControls()}
      {!isViewingHistorical && isInProgress && renderInProgressControls()}
      {!isViewingHistorical && renderDialogsAndCmdk()}
    </Portal>
  );
};

export default VaultActionsControls;
