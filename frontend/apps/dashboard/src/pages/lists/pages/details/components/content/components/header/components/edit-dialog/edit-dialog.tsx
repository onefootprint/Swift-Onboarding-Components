import { getOrgListsByListIdOptions, patchOrgListsByListIdMutation } from '@onefootprint/axios/dashboard';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { Dialog } from '@onefootprint/ui';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useInvalidateQueries from 'src/hooks/use-invalidate-queries';
import getAliasforListName from 'src/pages/lists/utils/get-alias-for-list-name';
import EditDialogForm from './components/edit-dialog-form';
import type { FormData } from './components/edit-dialog-form/edit-dialog-form.types';

export type EditDialogProps = {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
};

const EditDialog = ({ open, onClose, onEdit }: EditDialogProps) => {
  const { t } = useTranslation('lists', { keyPrefix: 'details.header.edit-dialog' });
  const router = useRouter();
  const id = router.query.id as string;
  const toast = useToast();
  const showErrorToast = useRequestErrorToast();
  const invalidateQueries = useInvalidateQueries();
  const { data } = useQuery({
    ...getOrgListsByListIdOptions({ path: { listId: id } }),
    enabled: !!id,
  });
  const updateListMutation = useMutation(patchOrgListsByListIdMutation());

  const handleBeforeSubmit = (formData: FormData) => {
    updateListMutation.mutate(
      {
        path: { listId: id },
        body: {
          name: formData.name,
          alias: getAliasforListName(formData.name),
        },
      },
      {
        onError: showErrorToast,
        onSuccess: () => {
          invalidateQueries();
          toast.show({
            title: t('feedback.success.title'),
            description: t('feedback.success.description'),
          });
          onEdit();
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
        form: 'update-list-form',
        label: t('cta.save.label'),
        loadingAriaLabel: t('cta.save.aria-label'),
        type: 'submit',
      }}
      secondaryButton={{
        label: t('cta.cancel'),
        onClick: onClose,
      }}
    >
      <EditDialogForm defaultName={data?.name} handleBeforeSubmit={handleBeforeSubmit} />
    </Dialog>
  );
};

export default EditDialog;
