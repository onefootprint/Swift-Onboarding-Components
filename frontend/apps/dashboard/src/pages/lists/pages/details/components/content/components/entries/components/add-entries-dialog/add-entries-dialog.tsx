import { getOrgListsByListIdOptions } from '@onefootprint/axios/dashboard';
import { postOrgListsByListIdEntriesMutation } from '@onefootprint/axios/dashboard';
import { getErrorMessage } from '@onefootprint/request';
import { Dialog, useToast } from '@onefootprint/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useInvalidateQueries from 'src/hooks/use-invalidate-queries';
import type { FormData } from './add-entries-dialog.types';
import AddEntriesForm from './components/add-entries-form';

type AddEntriesDialogProps = {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
};

const AddEntriesDialog = ({ open, onClose, onAdd }: AddEntriesDialogProps) => {
  const { t } = useTranslation('lists', { keyPrefix: 'details.entries.add-entries-dialog' });
  const router = useRouter();
  const id = router.query.id as string;
  const toast = useToast();
  const invalidateQueries = useInvalidateQueries();
  const postOrgListsByListIdEntriesMutate = useMutation(postOrgListsByListIdEntriesMutation());
  const { data: list } = useQuery(getOrgListsByListIdOptions({ path: { listId: id } }));

  const handleSubmit = (formData: FormData) => {
    postOrgListsByListIdEntriesMutate.mutate(
      {
        path: { listId: id },
        body: {
          entries: formData.entries
            .split(',')
            .map(entry => entry.trim())
            .filter(Boolean),
        },
      },
      {
        onSuccess: () => {
          toast.show({
            title: t('feedback.success.title'),
            description: t('feedback.success.description'),
          });
          invalidateQueries();
          onAdd();
          onClose();
        },
        onError: (error: Error) => {
          toast.show({
            title: t('feedback.error.title'),
            description: getErrorMessage(error),
            variant: 'error',
          });
        },
      },
    );
  };

  return list ? (
    <Dialog
      size="compact"
      title={t('title')}
      open={open}
      onClose={onClose}
      primaryButton={{
        form: 'add-entries-form',
        label: t('cta.save.label'),
        type: 'submit',
        loading: postOrgListsByListIdEntriesMutate.isPending,
      }}
      secondaryButton={{
        label: t('cta.cancel'),
        onClick: onClose,
        disabled: postOrgListsByListIdEntriesMutate.isPending,
      }}
    >
      <AddEntriesForm onSubmit={handleSubmit} />
    </Dialog>
  ) : null;
};

export default AddEntriesDialog;
