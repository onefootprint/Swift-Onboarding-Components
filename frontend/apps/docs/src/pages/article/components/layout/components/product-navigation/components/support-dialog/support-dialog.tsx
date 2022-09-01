import { useTranslation } from 'hooks';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';
import { Dialog, TextArea, TextInput, Typography } from 'ui';

export type SupportFormData = {
  [FormField.name]: string;
  [FormField.email]: string;
  [FormField.message]: string;
};

enum FormField {
  email = 'email',
  name = 'name',
  message = 'message',
}

type SupportDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SupportFormData) => void;
  title: string;
  description: string;
};

const SupportDialog = ({
  title,
  description,
  open,
  onClose,
  onSubmit,
}: SupportDialogProps) => {
  const { t } = useTranslation('components.support-dialog');
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<SupportFormData>();

  useEffect(() => {
    reset();
  }, [open]);

  const getNameHintText = () =>
    errors.name ? t('form.name.errors.required') : undefined;
  const getEmailHintText = () =>
    errors.email ? t('form.email.errors.required') : undefined;
  const getMessageHintText = () =>
    errors.message ? t('form.message.errors.required') : undefined;

  const formId = 'support-dialog-id';

  return (
    <Dialog
      size="compact"
      title={title}
      primaryButton={{
        label: t('form.primary-button'),
        form: formId,
        type: 'submit',
      }}
      secondaryButton={{
        label: t('form.secondary-button'),
        onClick: onClose,
        form: formId,
        type: 'reset',
      }}
      onClose={onClose}
      open={open}
    >
      <Form id="support-dialog-id" onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="body-2">{description}</Typography>
        <TextInput
          hasError={!!errors.name}
          hintText={getNameHintText()}
          label={t('form.name.label')}
          placeholder={t('form.name.placeholder')}
          type="text"
          {...register(FormField.name, {
            required: {
              value: true,
              message: t('name.errors.required'),
            },
          })}
        />
        <TextInput
          hasError={!!errors.email}
          hintText={getEmailHintText()}
          label={t('form.email.label')}
          placeholder={t('form.email.placeholder')}
          type="email"
          {...register(FormField.email, {
            required: {
              value: true,
              message: t('email.errors.required'),
            },
          })}
        />
        <TextArea
          hasError={!!errors.message}
          hintText={getMessageHintText()}
          label={t('form.message.label')}
          placeholder={t('form.message.placeholder')}
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...register(FormField.message, {
            required: {
              value: true,
              message: t('message.errors.required'),
            },
          })}
        />
      </Form>
    </Dialog>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default SupportDialog;
