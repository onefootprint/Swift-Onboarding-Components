import { patchOrgRolesByTenantRoleIdMutation } from '@onefootprint/axios/dashboard';
import type { UpdateTenantRoleRequest } from '@onefootprint/request-types/dashboard';
import { getErrorMessage } from '@onefootprint/request/src/request';
import type { Role } from '@onefootprint/types';
import { Dialog, useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Form from 'src/components/roles/create-dialog/components/form';
import type { VaultProxySelectOption } from 'src/components/roles/create-dialog/components/form/form.types';
import { useVaultProxyOptions } from 'src/components/roles/hooks';
import groupScopes from 'src/components/roles/utils/group-scopes';
import useInvalidateQueries from 'src/hooks/use-invalidate-queries';

export type EditHandler = {
  edit: () => void;
};

export type EditProps = {
  role: Role;
};

const Edit = forwardRef<EditHandler, EditProps>(({ role }, ref) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('roles', {
    keyPrefix: 'edit',
  });
  const { t: scopesT } = useTranslation('roles', {
    keyPrefix: 'scopes',
  });
  const toast = useToast();
  const invalidateQueries = useInvalidateQueries();
  const [open, setOpen] = useState(false);
  const editRoleMutation = useMutation(patchOrgRolesByTenantRoleIdMutation({ throwOnError: true }));
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

  const handleSubmit = (payload: UpdateTenantRoleRequest) => {
    editRoleMutation.mutate(
      {
        body: payload,
        path: { tenantRoleId: role.id },
      },
      {
        onSuccess: response => {
          toast.show({
            title: t('notifications.success.title'),
            description: t('notifications.success.description', { name: response?.name }),
          });
          invalidateQueries();
          handleClose();
        },
        onError: (error: unknown) => {
          toast.show({
            title: t('notifications.error.title'),
            description: getErrorMessage(error),
            variant: 'error',
          });
        },
      },
    );
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
          scopeKinds: basicScopes,
        }}
        kind={role.kind}
      />
    </Dialog>
  );
});

export default Edit;
