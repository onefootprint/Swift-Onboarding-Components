import { postOrgRolesMutation } from '@onefootprint/axios/dashboard';
import type { TenantRoleKindDiscriminant } from '@onefootprint/request-types/dashboard';
import type { CreateTenantRoleRequest } from '@onefootprint/request-types/dashboard';
import { getErrorMessage } from '@onefootprint/request/src/request';
import { Dialog } from '@onefootprint/ui';
import { useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import useInvalidateQueries from 'src/hooks/use-invalidate-queries';
import Form from './components/form';

export type CreateDialogProps = {
  open: boolean;
  handleClose: () => void;
  kind: TenantRoleKindDiscriminant;
};

const CreateDialog = ({ open, handleClose, kind }: CreateDialogProps) => {
  const { t: allT } = useTranslation('common');
  const { t: rolesT } = useTranslation('roles');
  const toast = useToast();
  const invalidateQueries = useInvalidateQueries();
  const createRoleMutation = useMutation(postOrgRolesMutation({ throwOnError: true }));

  const handleSubmit = (payload: CreateTenantRoleRequest) => {
    createRoleMutation.mutate(
      { body: payload },
      {
        onError: (error: unknown) => {
          toast.show({
            title: rolesT('create.notifications.error.title'),
            description: getErrorMessage(error),
            variant: 'error',
          });
        },
        onSuccess: response => {
          toast.show({
            title: rolesT('create.notifications.success.title'),
            description: rolesT('create.notifications.success.description', { name: response.name }),
          });
          invalidateQueries();
          handleClose();
        },
      },
    );
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
