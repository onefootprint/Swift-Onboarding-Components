import { deleteOrgListsByListIdEntriesByListEntryIdMutation } from '@onefootprint/axios/dashboard';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoCloseSmall16 } from '@onefootprint/icons';
import type { ListEntry } from '@onefootprint/request-types/dashboard';
import { IconButton, LoadingSpinner, useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useInvalidateQueries from 'src/hooks/use-invalidate-queries';

type EntryChipProps = {
  entry: ListEntry;
  disabled?: boolean; // injected by the PermissionsGate
};

const EntryChip = ({ entry: { data, id }, disabled }: EntryChipProps) => {
  const { t } = useTranslation('lists', { keyPrefix: 'details.entries' });
  const router = useRouter();
  const listId = router.query.id as string;
  const showRequestErrorToast = useRequestErrorToast();
  const toast = useToast();
  const invalidateQueries = useInvalidateQueries();
  const deleteEntryMutation = useMutation({
    ...deleteOrgListsByListIdEntriesByListEntryIdMutation({
      path: { listId, listEntryId: id },
    }),
    onSuccess: () => invalidateQueries(),
  });

  const handleDelete = async () => {
    try {
      await deleteEntryMutation.mutateAsync({ path: { listId, listEntryId: id } });
      toast.show({
        title: t('deleted-toast.title'),
        description: t('deleted-toast.description'),
      });
    } catch (err) {
      showRequestErrorToast(err);
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center rounded-full overflow-hidden w-fit"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      key={id}
    >
      <span className="bg-secondary py-0.5 pl-3 pr-2">
        <div className="text-body-3 truncate text-primary">{data}</div>
      </span>
      {deleteEntryMutation.isPending ? (
        <IconButton aria-label={`Deleting ${data}`} data-disabled={disabled}>
          <LoadingSpinner size={16} />
        </IconButton>
      ) : (
        <IconButton
          aria-label={`Delete ${data}`}
          onClick={disabled ? undefined : handleDelete}
          data-disabled={disabled}
        >
          <IcoCloseSmall16 />
        </IconButton>
      )}
    </motion.div>
  );
};

export default EntryChip;
