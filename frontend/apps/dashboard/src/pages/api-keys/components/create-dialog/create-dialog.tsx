import { RoleKind } from '@onefootprint/types';
import { Dialog, Grid, Select, TextInput, useToast } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useRoles from 'src/hooks/use-roles/use-roles';

import Loading from './components/loading';
import useCreateApiKey from './hooks/use-create-api-key';

type CreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

type FormData = { name: string; role: { label: string; value: string } };

const CreateDialog = ({ open, onClose }: CreateDialogProps) => {
  const createApiKeyMutation = useCreateApiKey();
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.api-keys.create',
  });
  const toast = useToast();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormData>();

  const rolesQuery = useRoles(RoleKind.apiKey);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBeforeSubmit = (formData: FormData) => {
    const data = { name: formData.name, roleId: formData.role.value };
    createApiKeyMutation.mutate(data, {
      onSuccess: () => {
        toast.show({
          title: t('feedback.success.title'),
          description: t('feedback.success.description'),
        });
        handleClose();
      },
    });
  };

  return (
    <Dialog
      testID="create-dialog"
      title={t('title')}
      primaryButton={{
        form: 'create-secret-key-form',
        label: t('cta.label'),
        loading: createApiKeyMutation.isLoading,
        loadingAriaLabel: t('cta.aria-label'),
        type: 'submit',
      }}
      secondaryButton={{
        disabled: createApiKeyMutation.isLoading,
        label: t('cancel'),
        onClick: handleClose,
      }}
      onClose={handleClose}
      open={open}
    >
      <form onSubmit={handleSubmit(handleBeforeSubmit)} id="create-secret-key-form">
        <Grid.Container columns={['1fr', '2fr']} gap={7}>
          <TextInput
            autoFocus
            hasError={!!errors.name}
            hint={errors?.name?.message}
            label={t('form.name.label')}
            placeholder={t('form.name.placeholder')}
            {...register('name', {
              required: {
                value: true,
                message: t('form.name.errors.required'),
              },
            })}
          />
          {rolesQuery.isLoading && <Loading />}
          {rolesQuery.data && (
            <Controller
              control={control}
              name="role"
              rules={{ required: true }}
              render={select => (
                <Select
                  label={t('form.access-control.label')}
                  hasError={!!select.fieldState.error}
                  hint={select.fieldState.error && t('form.access-control.errors.required')}
                  options={rolesQuery.options}
                  onBlur={select.field.onBlur}
                  onChange={select.field.onChange}
                  value={select.field.value}
                  placeholder={t('form.access-control.placeholder')}
                />
              )}
            />
          )}
        </Grid.Container>
      </form>
    </Dialog>
  );
};

export default CreateDialog;
