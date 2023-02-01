import { useTranslation } from '@onefootprint/hooks';
import { Dialog as FPDialog } from '@onefootprint/ui';
import React from 'react';

import Form from './components/form';
import type { FormData } from './dialog.types';
import useCreateRole from './hooks/use-create-role';

type DialogProps = {
  onClose: () => void;
  open: boolean;
};

const Dialog = ({ onClose, open }: DialogProps) => {
  const { t, allT } = useTranslation('pages.settings.roles.create');
  const createRoleMutation = useCreateRole();

  const handleSubmit = (formData: FormData) => {
    const { name, scopes, decryptFields } = formData;
    const decryptScopes = decryptFields.map(({ value }) => value);
    createRoleMutation.mutate(
      {
        name,
        scopes: ['read', ...scopes, ...decryptScopes],
      },
      { onSuccess: onClose },
    );
  };

  return (
    <FPDialog
      size="compact"
      title={t('title')}
      onClose={onClose}
      open={open}
      primaryButton={{
        form: 'role-create-form',
        label: allT('create'),
        type: 'submit',
        loading: createRoleMutation.isLoading,
      }}
      secondaryButton={{
        label: allT('cancel'),
        onClick: onClose,
        disabled: createRoleMutation.isLoading,
      }}
    >
      <Form onSubmit={handleSubmit} />
    </FPDialog>
  );
};

export default Dialog;
