import { useTranslation } from '@onefootprint/hooks';
import { OrgRolePermission } from '@onefootprint/types';
import { Dialog, useToast } from '@onefootprint/ui';
import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';

import CreateRoleForm, {
  CreateRoleFormData,
} from './components/create-role-form';
import useCreateOrgRole from './hooks/use-create-org-role';

type CreateRoleProps = {
  open: boolean;
  onClose: () => void;
};

const CreateRole = ({ open, onClose }: CreateRoleProps) => {
  const { t } = useTranslation('pages.settings.team-roles.create-role');
  const toast = useToast();
  const { data } = useSessionUser();
  const orgRoleMutation = useCreateOrgRole();

  const handleSubmit = (formData: CreateRoleFormData) => {
    if (!data) {
      return;
    }
    const { auth: authToken } = data;
    const { name, ...rest } = formData;
    const permissions = Object.entries(rest)
      .filter(entry => {
        const permissionOn = !!entry[1];
        return permissionOn;
      })
      .map(entry => {
        const permissionName = entry[0];
        return permissionName;
      }) as OrgRolePermission[];

    orgRoleMutation.mutate(
      { authToken, name, permissions },
      {
        onSuccess({ name: roleName }) {
          toast.show({
            title: t('toast.success.title'),
            description: t('toast.success.description', {
              name: roleName,
            }),
          });
        },
      },
    );
  };

  return (
    <Dialog
      title={t('title')}
      primaryButton={{
        form: 'create-role',
        label: t('form.cta'),
        type: 'submit',
      }}
      secondaryButton={{
        form: 'create-role',
        label: t('form.cancel'),
        type: 'reset',
        onClick: onClose,
      }}
      onClose={onClose}
      open={open}
      size="compact"
    >
      <CreateRoleForm onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default CreateRole;
