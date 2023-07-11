import { useTranslation } from '@onefootprint/hooks';
import { CreateRoleRequest, RoleScopeKind } from '@onefootprint/types';
import { Box, Button, Dialog } from '@onefootprint/ui';
import React, { useState } from 'react';
import PermissionGate from 'src/components/permission-gate';

import Form from '../form';
import useCreateRole from './hooks/use-create-role';

const Create = () => {
  const { t, allT } = useTranslation('pages.settings.roles.create');
  const [open, setOpen] = useState(false);
  const createRoleMutation = useCreateRole();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (payload: CreateRoleRequest) => {
    createRoleMutation.mutate(payload, { onSuccess: handleClose });
  };

  return (
    <Box>
      <PermissionGate
        scopeKind={RoleScopeKind.orgSettings}
        fallbackText={t('not-allowed')}
      >
        <Button onClick={handleOpen} size="small" variant="secondary">
          {t('title')}
        </Button>
      </PermissionGate>
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
    </Box>
  );
};

export default Create;
