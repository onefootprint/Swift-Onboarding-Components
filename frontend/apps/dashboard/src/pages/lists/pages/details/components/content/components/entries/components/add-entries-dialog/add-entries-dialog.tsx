import { Dialog, TextArea, useToast } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import useValidateListEntries from '@/lists/hooks/use-validate-list-entries';
import useList from '@/lists/pages/details/hooks/use-list';

import useAddEntries from './hooks/use-add-entries';

type AddEntriesDialogProps = {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
};

type FormData = {
  entries: string;
};

const AddEntriesDialog = ({ open, onClose, onAdd }: AddEntriesDialogProps) => {
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.entries.add-entries-dialog',
  });
  const toast = useToast();
  const router = useRouter();
  const id = router.query.id as string;
  const { data: list } = useList(id);
  const validateEntries = useValidateListEntries();
  const addEntriesMutation = useAddEntries(id);
  const {
    reset,
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleBeforeSubmit = (formData: FormData) => {
    const entriesToSave = formData.entries
      .split(',')
      .map(entry => entry.trim())
      .filter(entry => !!entry);
    addEntriesMutation.mutate(
      { listId: id, entries: entriesToSave },
      {
        onSuccess: () => {
          toast.show({
            title: t('feedback.success.title'),
            description: t('feedback.success.description'),
          });
          reset();
          onAdd();
        },
      },
    );
  };

  const entries = watch('entries');
  const getEntriesHint = () => {
    if (errors.entries) {
      if (!entries?.length) {
        return t('form.entries.errors.required');
      }
      return errors.entries.message;
    }
    return t('form.entries.hint');
  };

  return list ? (
    <Dialog
      size="compact"
      title={t('title')}
      testID="add-entries-dialog"
      open={open}
      onClose={onClose}
      primaryButton={{
        form: 'add-entries-form',
        label: t('cta.save.label'),
        loading: addEntriesMutation.isLoading,
        loadingAriaLabel: t('cta.save.aria-label'),
        type: 'submit',
      }}
      secondaryButton={{
        disabled: addEntriesMutation.isLoading,
        label: t('cta.cancel'),
        onClick: handleCancel,
      }}
    >
      <form onSubmit={handleSubmit(handleBeforeSubmit)} id="add-entries-form">
        <TextArea
          label={t('form.entries.label')}
          placeholder={t('form.entries.placeholder')}
          hasError={!!errors.entries}
          hint={getEntriesHint()}
          {...register('entries', {
            required: true,
            validate: val => validateEntries(list.kind, val),
          })}
        />
      </form>
    </Dialog>
  ) : null;
};

export default AddEntriesDialog;
