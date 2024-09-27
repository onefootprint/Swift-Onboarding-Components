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
  const { t: allT } = useTranslation('common');
  const { t: rolesT } = useTranslation('roles');
  const createRoleMutation = useCreateRole();
  const handleSubmit = (payload: CreateRoleRequest) => {
    createRoleMutation.mutate(payload, { onSuccess: handleClose });
  };
  return (
    <Dialog
      onClose={handleClose}
      open={open}
      size="compact"
      title={rolesT('create.title')}
      primaryButton={{
        form: 'roles-form',
        label: allT('create'),
        loading: createRoleMutation.isPending,
        type: 'submit',
      }}
      secondaryButton={{
        disabled: createRoleMutation.isPending,
        label: allT('cancel'),
        onClick: handleClose,
      }}
    >
      <Form onSubmit={handleSubmit} kind={kind} />
    </Dialog>
  );
};

export default CreateDialog;
