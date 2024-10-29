import { Button, SplitButton, Stack, Tooltip } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import { DECRYPT_VAULT_FORM_ID } from '@/entity/constants';
import type { DataIdentifier, Entity } from '@onefootprint/types';
import hasSomeDiDecryptable from 'src/utils/has-some-di-decryptable';
import { useDecryptControls } from '../../../vault/components/vault-actions';
import ReasonDialog from '../../../vault/components/vault-actions/components/reason-dialog';

export type DecryptHistoricalProps = { entity: Entity; seqno: string | undefined };

const DecryptHistoricalButton = ({ entity, seqno }: DecryptHistoricalProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('entity-details');
  const decryptControls = useDecryptControls();
  const canDecrypt = hasSomeDiDecryptable(entity);
  const { data, update: updateVault } = useEntityVault(entity.id, entity);
  const entityVault = data?.vault;

  const handleDecryptSubmit = () => {
    decryptControls.decrypt(
      entity.id,
      entityVault,
      {
        onSuccess: newData => {
          updateVault({ vault: newData, transforms: {}, dataKinds: {} }); // Update vault will take care of this using the already existing transforms and dataKinds
        },
      },
      seqno,
    );
  };

  return (
    <>
      {decryptControls.isIdle && (
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
                  onSelect: () => {
                    if (entityVault) {
                      decryptControls.start();
                      const fields = Object.keys(entityVault).map(di => di as DataIdentifier);
                      decryptControls.submitAllFieldsHistorical(fields);
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
            {allT('cancel')}
          </Button>
          <Button form={DECRYPT_VAULT_FORM_ID} type="submit">
            {allT('next')}
          </Button>
        </Stack>
      )}
      <ReasonDialog
        loading={decryptControls.isPending}
        onClose={decryptControls.cancel}
        onSubmit={handleDecryptSubmit}
        open={decryptControls.isOpen}
      />
    </>
  );
};

export default DecryptHistoricalButton;
