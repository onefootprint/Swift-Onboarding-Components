import { useTranslation } from '@onefootprint/hooks';
import { OrgRole, UpdateOrgRoleRequest } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useState } from 'react';

import Form from '../../../../../form';
import useEditRole from './hooks/use-edit-role';

export type EditHandler = {
  edit: () => void;
};

export type EditProps = {
  role: OrgRole;
};

const Edit = forwardRef<EditHandler, EditProps>(({ role }, ref) => {
  const { t, allT } = useTranslation('pages.settings.roles.edit');
  const { t: scopesT } = useTranslation('pages.settings.roles.scopes');
  const [open, setOpen] = useState(false);
  const editRoleMutation = useEditRole(role.id);
  const decryptScopes = role.scopes.filter(scope =>
    scope.startsWith('decrypt'),
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (payload: UpdateOrgRoleRequest) => {
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
          decryptFields: decryptScopes.map(scope => ({
            value: scope,
            label: scopesT(scope),
          })),
          name: role.name,
          scopes: role.scopes,
          showDecrypt: role.scopes.some(scope => scope.includes('decrypt')),
        }}
      />
    </Dialog>
  );
});

export default Edit;
