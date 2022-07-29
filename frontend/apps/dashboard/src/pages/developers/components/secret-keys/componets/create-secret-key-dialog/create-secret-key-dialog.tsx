import { useTranslation } from 'hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { Dialog, TextInput } from 'ui';

type CreateSecretKeyDialogProps = {
  open: boolean;
  onClose: () => void;
};

type FormData = { name: string };

const CreateSecretKeyDialog = ({
  open,
  onClose,
}: CreateSecretKeyDialogProps) => {
  const { t } = useTranslation('pages.developers.secret-keys.create');
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

  const onSubmit = (formData: FormData) => {
    console.log('formData', formData);
  };

  return (
    <Dialog
      size="compact"
      title={t('title')}
      primaryButton={{
        form: 'create-secret-key-form',
        label: t('cta'),
        onClick: onSubmit,
        type: 'submit',
      }}
      secondaryButton={{
        label: t('cancel'),
        onClick: handleClose,
      }}
      onClose={handleClose}
      open={open}
    >
      <Form onSubmit={handleSubmit(onSubmit)} id="create-secret-key-form">
        <TextInput
          autoFocus
          hasError={!!errors.name}
          hintText={errors?.name?.message}
          label={t('form.name.label')}
          placeholder={t('form.name.placeholder')}
          {...register('name', {
            required: {
              value: true,
              message: t('form.name.errors.required'),
            },
          })}
        />
      </Form>
    </Dialog>
  );
};

const Form = styled.form``;

export default CreateSecretKeyDialog;
