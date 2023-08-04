import { useTranslation } from '@onefootprint/hooks';
import { Role, UpdateRoleRequest } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useState } from 'react';

import useVaultProxyOptions from '../../../../../../../../hooks/use-vault-proxy-options';
import groupScopes from '../../../../../../../../utils/group-scopes';
import Form from '../../../../../create/components/form';
import { VaultProxySelectOption } from '../../../../../create/components/form/form.types';
import useEditRole from './hooks/use-edit-role';

export type EditHandler = {
  edit: () => void;
};

export type EditProps = {
  role: Role;
};

const Edit = forwardRef<EditHandler, EditProps>(({ role }, ref) => {
  const { t, allT } = useTranslation('pages.settings.roles.edit');
  const { t: scopesT } = useTranslation('pages.settings.roles.scopes');
  const [open, setOpen] = useState(false);
  const editRoleMutation = useEditRole(role.id);
  const { allOptions: allVaultProxyOptions } = useVaultProxyOptions();
  const { decryptOptions, basicScopes, vaultProxyOptions } = groupScopes(
    role.scopes,
  );

  const selectedVaultProxyOptions: VaultProxySelectOption[] = [];
  vaultProxyOptions.forEach(opt => {
    const existingOption = allVaultProxyOptions.find(o => o.value === opt);
    if (existingOption) {
      selectedVaultProxyOptions.push(existingOption);
    }
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (payload: UpdateRoleRequest) => {
    editRoleMutation.mutate(payload, { onSuccess: handleClose });
  };

  useImperativeHandle(
    ref,
    () => ({
      edit: handleOpen,
    }),
    [],
  );

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      title={t('title')}
      size="compact"
      primaryButton={{
        form: 'roles-form',
        label: allT('save'),
        loading: editRoleMutation.isLoading,
        type: 'submit',
      }}
      secondaryButton={{
        disabled: editRoleMutation.isLoading,
        label: allT('cancel'),
        onClick: handleClose,
      }}
    >
      <Form
        onSubmit={handleSubmit}
        defaultValues={{
          decryptOptions: decryptOptions.map(opt => ({
            value: opt,
            label: scopesT(`decrypt.${opt}`),
          })),
          showDecrypt: !!decryptOptions.length,
          vaultProxyConfigs: selectedVaultProxyOptions,
          showProxyConfigs: !!vaultProxyOptions.length,
          name: role.name,
          scopeKinds: basicScopes.map(s => s.kind),
        }}
      />
    </Dialog>
  );
});

export default Edit;
