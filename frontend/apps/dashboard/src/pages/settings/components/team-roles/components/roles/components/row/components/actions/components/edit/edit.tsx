import { useTranslation } from '@onefootprint/hooks';
import { Role, UpdateRoleRequest } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useState } from 'react';

import Form from '../../../../../form';
import groupScopes from '../../../scopes/utils/group-scopes';
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
  const { decryptOptions, nonDecryptScopes } = groupScopes(role.scopes);

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
          name: role.name,
          scopeKinds: nonDecryptScopes.map(s => s.kind),
          showDecrypt: !!decryptOptions.length,
        }}
      />
    </Dialog>
  );
});

export default Edit;
