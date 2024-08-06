import type { CreateRoleRequest, RoleKind } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import Form from './components/form';
import useCreateRole from './hooks/use-create-role';

export type CreateDialogProps = {
  open: boolean;
  handleClose: () => void;
  kind: RoleKind;
};

const CreateDialog = ({ open, handleClose, kind }: CreateDialogProps) => {
  const { t } = useTranslation('common');
  const createRoleMutation = useCreateRole();
  const handleSubmit = (payload: CreateRoleRequest) => {
    createRoleMutation.mutate(payload, { onSuccess: handleClose });
  };
  return (
    <Dialog
      onClose={handleClose}
      open={open}
      size="compact"
      title={t('pages.settings.roles.create.title')}
      primaryButton={{
        form: 'roles-form',
        label: t('create'),
        loading: createRoleMutation.isLoading,
        type: 'submit',
      }}
      secondaryButton={{
        disabled: createRoleMutation.isLoading,
        label: t('cancel'),
        onClick: handleClose,
      }}
    >
      <Form onSubmit={handleSubmit} kind={kind} />
    </Dialog>
  );
};

export default CreateDialog;
