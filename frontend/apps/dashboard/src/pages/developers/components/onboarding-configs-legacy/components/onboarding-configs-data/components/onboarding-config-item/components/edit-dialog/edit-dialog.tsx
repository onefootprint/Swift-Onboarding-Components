import { useTranslation } from '@onefootprint/hooks';
import { Dialog, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

type FormData = { name: string };

type EditDialogProps = {
  defaultValues: FormData;
  onClose: () => void;
  onSubmit: (formData: FormData) => void;
  open: boolean;
};

const EditDialog = ({
  defaultValues,
  onClose,
  onSubmit,
  open,
}: EditDialogProps) => {
  const { t } = useTranslation('pages.developers.onboarding-configs.edit');
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    defaultValues,
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleBeforeSubmit = (formData: FormData) => {
    if (isDirty) {
      onSubmit(formData);
    }
    onClose();
  };

  return (
    <Dialog
      size="compact"
      title={t('title')}
      primaryButton={{
        form: 'edit-onboarding-config-form',
        label: t('cta'),
        type: 'submit',
      }}
      secondaryButton={{
        label: t('cancel'),
        onClick: handleClose,
      }}
      onClose={handleClose}
      open={open}
    >
      <form
        onSubmit={handleSubmit(handleBeforeSubmit)}
        id="edit-onboarding-config-form"
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

export default EditDialog;
