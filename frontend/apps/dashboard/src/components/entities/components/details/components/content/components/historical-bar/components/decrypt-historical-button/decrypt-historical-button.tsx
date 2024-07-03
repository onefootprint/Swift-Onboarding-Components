import { Button, SplitButton, Stack, Tooltip } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import type { WithEntityProps } from '@/entity/components/with-entity';
import { DECRYPT_VAULT_FORM_ID } from '@/entity/constants';

import { DataIdentifier } from '@onefootprint/types';
import { useDecryptControls } from '../../../vault/components/vault-actions';
import ReasonDialog from '../../../vault/components/vault-actions/components/reason-dialog';

export type DecryptHistoricalProps = WithEntityProps;

const DecryptHistoricalButton = ({ entity }: DecryptHistoricalProps) => {
  const { t } = useTranslation('common');
  const decryptControls = useDecryptControls();
  const canDecrypt = !!entity.decryptableAttributes.length;
  const { data, update: updateVault } = useEntityVault(entity.id, entity);
  const entityVault = data?.vault;

  const handleDecryptSubmit = () => {
    decryptControls.decrypt(entity.id, entityVault, {
      onSuccess: newData => updateVault({ vault: newData, transforms: {}, dataKinds: {} }), // Update vault will take care of this using the already existing transforms and dataKinds
    });
  };

  return (
    <>
      {decryptControls.isIdle && (
        <Stack gap={3} align="center">
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
                  onSelect: () => {
                    if (entityVault) {
                      decryptControls.submitAllFields();
                    }
                  },
                },
              ]}
            />
          </Tooltip>
        </Stack>
      )}
      {decryptControls.inProgress && (
        <Stack gap={3}>
          <Button variant="secondary" onClick={decryptControls.cancel}>
            {t('cancel')}
          </Button>
          <Button form={DECRYPT_VAULT_FORM_ID} type="submit">
            {t('next')}
          </Button>
        </Stack>
      )}
      <ReasonDialog
        loading={decryptControls.isLoading}
        onClose={decryptControls.cancel}
        onSubmit={handleDecryptSubmit}
        open={decryptControls.isOpen}
      />
    </>
  );
};

export default DecryptHistoricalButton;
