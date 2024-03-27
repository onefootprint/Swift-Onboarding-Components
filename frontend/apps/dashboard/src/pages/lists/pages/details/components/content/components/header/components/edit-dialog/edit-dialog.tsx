import { Dialog, Grid, TextInput, useToast } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import useList from '@/lists/pages/details/hooks/use-list';

import useUpdateList from './hooks/use-update-list';

export type EditDialogProps = {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
};

type FormData = {
  name: string;
};

const EditDialog = ({ open, onClose, onEdit }: EditDialogProps) => {
  const router = useRouter();
  const id = router.query.id as string;
  const updateListMutation = useUpdateList(id);
  const { t } = useTranslation('lists', {
    keyPrefix: 'details.header.edit-dialog',
  });
  const { data } = useList(id);
  const defaultName = data?.name;
  const toast = useToast();
  const {
    reset,
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { name: defaultName },
  });

  useEffect(() => {
    reset({ name: defaultName });
  }, [open, defaultName]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBeforeSubmit = (formData: FormData) => {
    updateListMutation.mutate(
      {
        name: formData.name,
        alias: getAliasForName(formData.name),
      },
      {
        onSuccess: () => {
          toast.show({
            title: t('feedback.success.title'),
            description: t('feedback.success.description'),
          });
          reset();
          onEdit();
        },
      },
    );
  };

  const listName = watch('name');
  const getAliasForName = (name: string = '') =>
    `@${name.replace(/[^a-z0-9_]/g, '_').toLowerCase()}`;

  const getNameHint = () => {
    if (!listName?.length) {
      return errors?.name?.message;
    }
    const alias = getAliasForName(listName);
    return t('form.name.hint', { alias });
  };

  return (
    <Dialog
      size="compact"
      testID="edit-dialog"
      onClose={onClose}
      open={open}
      title={t('title')}
      primaryButton={{
        form: 'update-list-form',
        label: t('cta.save.label'),
        loading: updateListMutation.isLoading,
        loadingAriaLabel: t('cta.save.aria-label'),
        type: 'submit',
      }}
      secondaryButton={{
        disabled: updateListMutation.isLoading,
        label: t('cta.cancel'),
        onClick: onClose,
      }}
    >
      <form onSubmit={handleSubmit(handleBeforeSubmit)} id="update-list-form">
        <Grid.Container gap={7}>
          <TextInput
            autoFocus
            hasError={!!errors.name}
            hint={getNameHint()}
            label={t('form.name.label')}
            placeholder={t('form.name.placeholder')}
            {...register('name', {
              required: {
                value: true,
                message: t('form.name.errors.required'),
              },
            })}
          />
        </Grid.Container>
      </form>
    </Dialog>
  );
};

export default EditDialog;
