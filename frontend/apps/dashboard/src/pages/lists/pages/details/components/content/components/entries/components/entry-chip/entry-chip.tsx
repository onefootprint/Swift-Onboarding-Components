import { deleteOrgListsByListIdEntriesByListEntryIdMutation } from '@onefootprint/axios/dashboard';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoCloseSmall16 } from '@onefootprint/icons';
import type { ListEntry } from '@onefootprint/request-types/dashboard';
import { LoadingSpinner, useToast } from '@onefootprint/ui';
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

  const closeButtonStyles =
    'flex items-center justify-center w-full h-full pr-[6px] pl-1 rounded-r-full bg-secondary hover:bg-senary transition-colors duration-100';

  return (
    <motion.div
      className="flex items-center justify-center overflow-hidden rounded-full w-fit"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      key={id}
    >
      <span className="bg-secondary py-0.5 pl-3 pr-2">
        <div className="truncate text-body-3 text-primary">{data}</div>
      </span>
      {deleteEntryMutation.isPending ? (
        <button aria-label={`Deleting ${data}`} data-disabled={disabled} type="button" className={closeButtonStyles}>
          <LoadingSpinner size={16} />
        </button>
      ) : (
        <button
          type="button"
          aria-label={`Delete ${data}`}
          onClick={disabled ? undefined : handleDelete}
          data-disabled={disabled}
          className={closeButtonStyles}
        >
          <IcoCloseSmall16 />
        </button>
      )}
    </motion.div>
  );
};

export default EntryChip;
