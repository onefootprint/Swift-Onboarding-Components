import { useTranslation } from '@onefootprint/hooks';
import { Box, Button, Portal, Tooltip } from '@onefootprint/ui';
import React from 'react';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import { WithEntityProps } from '@/entity/components/with-entity';
import { HEADER_ACTIONS_SELECTOR, VAULT_FORM_ID } from '@/entity/constants';

import ManualReview from './components/manual-review';
import ReasonDialog from './components/reason-dialog';
import RetriggerKYC from './components/retrigger-kyc';
import useDecryptControls from './hooks/use-decrypt-controls';

type DecryptControlsProps = WithEntityProps;

const DecryptControls = ({ entity }: DecryptControlsProps) => {
  const { allT, t } = useTranslation('pages.entity.decrypt');
  const controls = useDecryptControls();
  const canDecrypt = !!entity.decryptableAttributes.length;
  const entityVault = useEntityVault(entity.id, entity);

  const handleSubmit = () => {
    controls.decrypt(entity.id, entityVault.data, {
      onSuccess: entityVault.update,
    });
  };

  return (
    <Portal selector={HEADER_ACTIONS_SELECTOR}>
      {controls.isIdle && (
        <Tooltip disabled={canDecrypt} text={t('not-allowed')}>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <Button
              disabled={!canDecrypt}
              onClick={controls.start}
              size="small"
              variant="secondary"
            >
              {t('start')}
            </Button>
            <ManualReview />
            <RetriggerKYC />
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
