import { useTranslation } from '@onefootprint/hooks';
import { CreateRoleRequest } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import React from 'react';

import useCreateRole from '../../hooks/use-create-role';
import Form from '../form';

export type CreateDialogProps = {
  open: boolean;
  handleClose: () => void;
};

const CreateDialog = ({ open, handleClose }: CreateDialogProps) => {
  // TODO change translation path to be shared
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
      <Form onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default CreateDialog;
