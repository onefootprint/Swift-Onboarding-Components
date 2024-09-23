import type { Role, UpdateRoleRequest } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'src/components/roles/create-dialog/components/form';
import type { VaultProxySelectOption } from 'src/components/roles/create-dialog/components/form/form.types';
import { useVaultProxyOptions } from 'src/components/roles/hooks';
import groupScopes from 'src/components/roles/utils/group-scopes';

import useEditRole from './hooks/use-edit-role';

export type EditHandler = {
  edit: () => void;
};

export type EditProps = {
  role: Role;
};

const Edit = forwardRef<EditHandler, EditProps>(({ role }, ref) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.roles.edit',
  });
  const { t: scopesT } = useTranslation('common', {
    keyPrefix: 'pages.roles.scopes',
  });
  const [open, setOpen] = useState(false);
  const editRoleMutation = useEditRole(role.id);
  const { allOptions: allVaultProxyOptions } = useVaultProxyOptions();
  const { decryptOptions, basicScopes, vaultProxyOptions } = groupScopes(role.scopes);

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
        loading: editRoleMutation.isPending,
        type: 'submit',
      }}
      secondaryButton={{
        disabled: editRoleMutation.isPending,
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
        kind={role.kind}
      />
    </Dialog>
  );
});

export default Edit;
