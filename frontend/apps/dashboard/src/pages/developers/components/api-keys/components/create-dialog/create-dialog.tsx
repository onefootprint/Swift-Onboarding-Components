import { useTranslation } from '@onefootprint/hooks';
import { Dialog, TextInput, useToast } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import useCreateApiKey from './hooks/use-create-api-key';

type CreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

type FormData = { name: string };

const CreateDialog = ({ open, onClose }: CreateDialogProps) => {
  const createApiKeyMutation = useCreateApiKey();
  const { t } = useTranslation('pages.developers.api-keys.create');
  const toast = useToast();
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBeforeSubmit = (formData: FormData) => {
    createApiKeyMutation.mutate(formData, {
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
      size="compact"
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
      <form
        onSubmit={handleSubmit(handleBeforeSubmit)}
        id="create-secret-key-form"
      >
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
      </form>
    </Dialog>
  );
};

export default CreateDialog;
