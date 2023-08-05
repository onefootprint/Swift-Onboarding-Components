import { useTranslation } from '@onefootprint/hooks';
import { CreateRoleRequest, RoleKind } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import React from 'react';

import Form from './components/form';
import useCreateRole from './hooks/use-create-role';

export type CreateDialogProps = {
  open: boolean;
  handleClose: () => void;
  kind: RoleKind;
};

const CreateDialog = ({ open, handleClose, kind }: CreateDialogProps) => {
  const { t, allT } = useTranslation('pages.settings.roles.create');
  const createRoleMutation = useCreateRole();
  const handleSubmit = (payload: CreateRoleRequest) => {
    createRoleMutation.mutate(payload, { onSuccess: handleClose });
  };
  return (
    <Dialog
      onClose={handleClose}
      open={open}
      size="compact"
      title={t('title')}
      primaryButton={{
        form: 'roles-form',
        label: allT('create'),
        loading: createRoleMutation.isLoading,
        type: 'submit',
      }}
      secondaryButton={{
        disabled: createRoleMutation.isLoading,
        label: allT('cancel'),
        onClick: handleClose,
      }}
    >
      <Form onSubmit={handleSubmit} kind={kind} />
    </Dialog>
  );
};

export default CreateDialog;
