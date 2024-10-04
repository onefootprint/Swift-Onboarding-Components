import { EDIT_VAULT_FORM_ID } from '@/entity/constants';
import { EntityKind, type VaultValue } from '@onefootprint/types';
import { Drawer, InlineAlert, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import useDecryptControls from '../../hooks/use-decrypt-controls';
import useEditControls from '../../hooks/use-edit-controls';
import EditForm from './components/edit-form';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import type { WithEntityProps } from '@/entity/components/with-entity';
import { useEffectOnce } from 'usehooks-ts';
import BusinessVaultFieldsets from './components/business-vault-fieldsets';
import PersonVaultFieldsets from './components/person-vault-fieldsets';
import convertFormData from './utils/convert-form-data';

type EditVaultDrawerProps = WithEntityProps & {
  open: boolean;
  onClose: () => void;
};

const EditVaultDrawer = ({ entity, open, onClose }: EditVaultDrawerProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header-default.actions.edit-vault-drawer',
  });

  const decryptControls = useDecryptControls();
  const editControls = useEditControls();

  const { data: vaultData, update: updateVault, isAllDecrypted } = useEntityVault(entity.id, entity);
  const isPersonVault = entity.kind === EntityKind.person;

  useEffectOnce(() => {
    editControls.start();
  });

  const handleClose = () => {
    editControls.cancel();
    onClose();
  };

  const handleBeforeEditSubmit = (flattenedFormData: Record<string, VaultValue>) => {
    const previousData = vaultData?.vault;
    const convertedData = convertFormData(flattenedFormData, previousData);
    editControls.submitFields(convertedData);
    editControls.saveEdit(entity.id, convertedData, {
      onSuccess: response => {
        updateVault(response);
        handleClose();
      },
    });
  };

  const handleDecryptAll = () => {
    decryptControls.decryptManually(
      {
        reason: 'Editing vault data',
        dis: entity.decryptableAttributes,
        entityId: entity.id,
        vaultData: vaultData?.vault,
      },
      {
        onSuccess: newData => {
          updateVault({ vault: newData, transforms: {}, dataKinds: {} });
        },
      },
    );
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isPersonVault ? t('person-title') : t('business-title')}
      primaryButton={{
        label: t('cta'),
        loading: !!editControls.isPending,
        form: EDIT_VAULT_FORM_ID,
        type: 'submit',
      }}
      secondaryButton={{
        label: t('cancel'),
        onClick: handleClose,
      }}
    >
      <Stack direction="column" gap={7}>
        {!isAllDecrypted && (
          <InlineAlert
            variant="info"
            cta={{
              label: t('decrypt-alert.cta'),
              onClick: handleDecryptAll,
            }}
          >
            {t('decrypt-alert.text')}
          </InlineAlert>
        )}
        <EditForm onSubmit={handleBeforeEditSubmit}>
          {isPersonVault ? <PersonVaultFieldsets entity={entity} /> : <BusinessVaultFieldsets />}
        </EditForm>
      </Stack>
    </Drawer>
  );
};

export default EditVaultDrawer;
