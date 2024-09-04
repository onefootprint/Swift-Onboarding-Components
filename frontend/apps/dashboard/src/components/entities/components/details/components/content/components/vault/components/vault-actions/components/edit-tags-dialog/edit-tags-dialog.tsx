import { Dialog, useToast } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import { LinkButton, Stack, Text } from '@onefootprint/ui';

import type { WithEntityProps } from '@/entity/components/with-entity';
import useTags from '@/entity/hooks/use-tags';
import { useRequestError } from '@onefootprint/request';
import type { OrgTag } from '@onefootprint/types';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import unionBy from 'lodash/unionBy';
import { useEffect, useState } from 'react';
import ErrorComponent from 'src/components/error';
import ActiveTags from './components/active-tags';
import InactiveTags from './components/inactive-tags';
import Loading from './components/loading';
import useAddTag from './hooks/use-add-tag';
import useCreateOrgTag from './hooks/use-create-org-tag';
import useRemoveTag from './hooks/use-remove-tag';
import type { EditedTag } from './types';

export type EditTagsDialogProps = WithEntityProps & {
  open: boolean;
  onClose: () => void;
};

const EditTagsDialog = ({ entity, open, onClose }: EditTagsDialogProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header.actions.edit-tags',
  });
  const { data: currentEntityTags, isLoading, error } = useTags(entity.id);
  const [activeTags, setActiveTags] = useState<EditedTag[]>(currentEntityTags ?? []);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const createTagMutation = useCreateOrgTag();
  const addTagMutation = useAddTag();
  const removeTagMutation = useRemoveTag();
  const toast = useToast();
  const { getErrorMessage } = useRequestError();

  useEffect(() => {
    setActiveTags(currentActive => unionBy(currentEntityTags, currentActive, 'text'));
  }, [currentEntityTags]);

  const handleTagVault = ({ text, id }: OrgTag) => {
    setActiveTags(currentActive => {
      const tagsToAdd = cloneDeep(currentActive);
      tagsToAdd.push({ text, id });
      return tagsToAdd;
    });
  };

  const handleUntagVault = (tag: EditedTag) => {
    setActiveTags(currentActive => currentActive.filter(activeTag => !isEqual(activeTag, tag)));
  };

  const handleClickAdd = () => {
    setIsAddingTag(true);
  };

  const handleAddNewTag = (text: string) => {
    setActiveTags(currentActive => {
      const tagsToAdd = cloneDeep(currentActive);
      tagsToAdd.push({ text });
      return tagsToAdd;
    });
    setIsAddingTag(false);
  };

  const handleRemoveNewTag = () => {
    setIsAddingTag(false);
  };

  const handleSave = () => {
    const tagsToAdd = activeTags.filter(tag => !currentEntityTags?.find(currTag => isEqual(currTag, tag)));
    const tagsToCreate = tagsToAdd.filter(tag => !tag.id);
    const tagsToRemove = (currentEntityTags ?? []).filter(
      ({ text: currText }) => !activeTags.find(({ text }) => text === currText),
    );
    const errors: Record<string, string> = {};
    const totalNumChanges = tagsToCreate.length + tagsToAdd.length + tagsToRemove.length - 1;

    const onSuccess = (index: number) => {
      if (index === totalNumChanges) {
        toast.show({
          title: t('success-toast.title'),
          description: t('success-toast.description'),
        });
      }
    };
    const onError = (tagText: string, e: unknown) => {
      errors[tagText] = getErrorMessage(e);
    };

    tagsToCreate.forEach(({ text }, index) => {
      createTagMutation.mutate(
        { kind: entity.kind, text },
        {
          onSuccess: () => onSuccess(index),
          onError: (e: unknown) => onError(text, e),
        },
      );
    });
    tagsToAdd.forEach(({ text }, index) => {
      addTagMutation.mutate(
        { id: entity.id, text },
        {
          onSuccess: () => onSuccess(index + tagsToCreate.length),
          onError: (e: unknown) => onError(text, e),
        },
      );
    });
    tagsToRemove.forEach(({ id, text }, index) => {
      removeTagMutation.mutate(
        { id: entity.id, tagId: id },
        {
          onSuccess: () => onSuccess(index + tagsToCreate.length + tagsToAdd.length),
          onError: (e: unknown) => onError(text, e),
        },
      );
    });

    if (Object.keys(errors).length) {
      toast.show({
        description: t('error-toast.description', {
          details: Object.entries(errors)
            .map(([tagText, error]) => `${tagText}: ${error}`)
            .join('\n'),
        }),
        title: t('error-toast.title'),
        variant: 'error',
      });
    } else {
      onClose();
    }
  };

  return (
    <Dialog
      size="compact"
      title={currentEntityTags?.length ? t('edit-title') : t('add-title')}
      onClose={onClose}
      open={open}
      primaryButton={{
        label: t('save'),
        loading: isLoading,
        disabled: isLoading || !!error,
        onClick: handleSave,
      }}
      secondaryButton={{
        label: t('cancel'),
        onClick: onClose,
        disabled: false,
      }}
    >
      <Stack direction="column" justify="flex-start" gap={5}>
        <Text variant="body-3">{t('description')}</Text>
        {isLoading && <Loading />}
        {error && <ErrorComponent error={error} />}
        {currentEntityTags && (
          <>
            <ActiveTags
              activeTags={activeTags}
              isAddingTag={isAddingTag}
              onRemove={handleUntagVault}
              onRemoveNew={handleRemoveNewTag}
              onAddNew={handleAddNewTag}
            />
            <InactiveTags entityKind={entity.kind} activeTags={activeTags} onClick={handleTagVault} />
            <LinkButton onClick={handleClickAdd} disabled={isAddingTag}>
              {t('add-tag')}
            </LinkButton>
          </>
        )}
      </Stack>
    </Dialog>
  );
};

export default EditTagsDialog;
