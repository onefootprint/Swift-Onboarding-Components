import type { WithEntityProps } from '@/entity/components/with-entity';
import useEntityTags from '@/entity/hooks/use-entity-tags';
import { Dialog } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useOrgTags from 'src/hooks/use-org-tags';

import ErrorComponent from 'src/components/error';
import Form from './components/form';
import Loading from './components/loading';
import useManageTags from './hooks/use-manage-tags';

export type EditTagsDialogProps = WithEntityProps & {
  open: boolean;
  onClose: () => void;
};

const EditTagsDialog = ({ entity, open, onClose }: EditTagsDialogProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'actions.edit-tags' });
  const entityTagsQuery = useEntityTags(entity.id);
  const orgTagsQuery = useOrgTags(entity.kind);
  const mutation = useManageTags(entity);
  const [isAdding, setIsAdding] = useState(false);
  const orgTags = orgTagsQuery.data;
  const entityTags = entityTagsQuery.data;

  const handleSubmit = (tags: string[]) => {
    const orgTagsToCreate = tags.filter(tag => !orgTags?.some(orgTag => orgTag.tag === tag));
    const entityTagsToAdd = tags.filter(tag => !entityTags?.some(entityTag => entityTag.tag === tag));
    const entityTagsToRemove = entityTags?.filter(entityTag => !tags.includes(entityTag.tag)) || [];
    mutation.mutate({ orgTagsToCreate, entityTagsToAdd, entityTagsToRemove }, { onSuccess: onClose });
  };

  return (
    <Dialog
      size="compact"
      title={entityTagsQuery.data?.length ? t('edit-title') : t('add-title')}
      onClose={onClose}
      onEscapeKeyDown={e => {
        if (isAdding) {
          e.preventDefault();
        } else {
          onClose();
        }
      }}
      open={open}
      primaryButton={{
        form: 'tags-form',
        label: t('save'),
        type: 'submit',
        loading: mutation.isPending,
      }}
      secondaryButton={{
        label: t('cancel'),
        onClick: onClose,
        disabled: mutation.isPending,
      }}
    >
      {entityTagsQuery.isLoading && <Loading />}
      {entityTagsQuery?.data && orgTagsQuery?.data && (
        <Form
          entityTags={entityTagsQuery.data}
          onSubmit={handleSubmit}
          orgTags={orgTagsQuery.data}
          adding={{
            value: isAdding,
            onChange: setIsAdding,
          }}
        />
      )}
      {entityTagsQuery.error && <ErrorComponent error={entityTagsQuery.error} />}
    </Dialog>
  );
};

export default EditTagsDialog;
