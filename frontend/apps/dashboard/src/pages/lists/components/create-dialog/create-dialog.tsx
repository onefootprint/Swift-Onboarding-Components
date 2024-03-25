import { ListKind } from '@onefootprint/types';
import type { SelectOption } from '@onefootprint/ui';
import {
  Dialog,
  Grid,
  Select,
  TextArea,
  TextInput,
  useToast,
} from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import useCreateList from './hooks/use-create-list';
import useValidateListEntries from './hooks/use-validate-list-entries';

export type CreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
};

type FormData = {
  name: string;
  kind: SelectOption<ListKind>;
  entries: string;
};

const CreateDialog = ({ open, onClose, onCreate }: CreateDialogProps) => {
  const createListMutation = useCreateList();
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.lists.dialog',
  });
  const toast = useToast();
  const {
    reset,
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
  } = useForm<FormData>();
  const validateEntries = useValidateListEntries();

  const handleCancel = () => {
    reset();
    onClose();
  };

  const handleBeforeSubmit = (formData: FormData) => {
    const data = {
      name: formData.name,
      kind: formData.kind.value,
      entries: formData.entries,
      alias: getAliasForName(formData.name),
    };
    createListMutation.mutate(data, {
      onSuccess: () => {
        toast.show({
          title: t('feedback.success.title'),
          description: t('feedback.success.description'),
        });
        reset();
        onCreate();
      },
    });
  };

  const kindOptions = Object.values(ListKind).map(kind => ({
    // @ts-ignore-next-line
    label: t(`form.kind.options.${kind}`),
    value: kind,
  }));

  const listName = watch('name');
  const kind = watch('kind');
  const entries = watch('entries');
  const getAliasForName = (name: string = '') =>
    `@${name.replace(/[^a-z0-9_]/g, '_').toLowerCase()}`;

  const getNameHint = () => {
    if (!listName?.length) {
      return errors?.name?.message;
    }
    const alias = getAliasForName(listName);
    return t('form.name.hint', { alias });
  };

  const getEntriesHint = () => {
    if (errors.entries) {
      if (!entries?.length) {
        return t('form.entries.errors.required');
      }
      return errors.entries.message;
    }
    return t('form.entries.hint');
  };

  const getEntriesHasError = () => !!errors.entries;

  return (
    <Dialog
      size="compact"
      testID="create-dialog"
      onClose={onClose}
      open={open}
      title={t('title')}
      primaryButton={{
        form: 'create-list-form',
        label: t('cta.create.label'),
        loading: createListMutation.isLoading,
        loadingAriaLabel: t('cta.create.aria-label'),
        type: 'submit',
      }}
      secondaryButton={{
        disabled: createListMutation.isLoading,
        label: t('cta.cancel'),
        onClick: handleCancel,
      }}
    >
      <form onSubmit={handleSubmit(handleBeforeSubmit)} id="create-list-form">
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
          <Controller
            control={control}
            name="kind"
            rules={{ required: true }}
            render={select => (
              <Select
                label={t('form.kind.label')}
                hasError={!!select.fieldState.error}
                hint={select.fieldState.error && t('form.kind.errors.required')}
                options={kindOptions}
                onBlur={select.field.onBlur}
                onChange={nextOption => {
                  setValue('entries', '');
                  select.field.onChange(nextOption);
                }}
                value={select.field.value}
                placeholder={t('form.kind.placeholder')}
              />
            )}
          />
          <TextArea
            label={t('form.entries.label')}
            placeholder={t('form.entries.placeholder')}
            hasError={getEntriesHasError()}
            hint={getEntriesHint()}
            {...register('entries', {
              required: true,
              validate: val => validateEntries(kind.value, val),
            })}
          />
        </Grid.Container>
      </form>
    </Dialog>
  );
};

export default CreateDialog;
