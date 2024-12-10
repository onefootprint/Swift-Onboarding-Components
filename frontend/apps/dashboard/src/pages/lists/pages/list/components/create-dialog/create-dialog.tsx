import { getOrgListsQueryKey, postOrgListsMutation } from '@onefootprint/axios/dashboard';
import { getErrorMessage } from '@onefootprint/request';
import { Dialog, useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import getAliasForListName from 'src/pages/lists/utils/get-alias-for-list-name';
import CreateListForm from './components/create-list-form';
import type { FormData } from './create-dialog.types';

export type CreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

const CreateDialog = ({ open, onClose }: CreateDialogProps) => {
  const { t } = useTranslation('lists', { keyPrefix: 'list.dialog' });
  const createListMutation = useMutation(postOrgListsMutation());
  const toast = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = (formData: FormData) => {
    createListMutation.mutate(
      {
        body: {
          name: formData.name,
          kind: formData.kind.value,
          entries:
            formData.entries
              ?.split(',')
              .map(entry => entry.trim())
              .filter(entry => entry) || [],
          alias: getAliasForListName(formData.name),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [getOrgListsQueryKey] });
          toast.show({
            title: t('feedback.success.title'),
            description: t('feedback.success.description'),
          });
          onClose();
        },
        onError: error => {
          toast.show({
            title: t('feedback.error.title'),
            description: getErrorMessage(error),
            variant: 'error',
          });
        },
      },
    );
  };

  return (
    <Dialog
      size="compact"
      onClose={onClose}
      open={open}
      title={t('title')}
      primaryButton={{
        form: 'create-list-form',
        label: t('cta.create.label'),
        type: 'submit',
        loading: createListMutation.isPending,
      }}
      secondaryButton={{
        label: t('cta.cancel'),
        disabled: createListMutation.isPending,
        onClick: onClose,
      }}
    >
      <CreateListForm onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default CreateDialog;
