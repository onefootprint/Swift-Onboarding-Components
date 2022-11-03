import { useTranslation } from '@onefootprint/hooks';
import {
  Dialog,
  TextArea,
  TextInput,
  Typography,
  useToast,
} from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import useSupportForm from '../../../article/components/article-layout/components/product-navigation/hooks/submit-support-form/use-support-form';
import {
  FormField,
  SupportFormData,
} from '../../../article/components/article-layout/components/product-navigation/types';

type SupportDialogProps = {
  url: string;
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
};

const SupportDialog = ({
  url,
  title,
  description,
  open,
  onClose,
}: SupportDialogProps) => {
  const { t } = useTranslation('components.support-dialog');
  const submitFormMutation = useSupportForm();
  const toast = useToast();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<SupportFormData>();

  useEffect(() => {
    reset();
    submitFormMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = (data: SupportFormData) => {
    submitFormMutation.mutate(
      { url, data },
      {
        onSuccess() {
          onClose();
          toast.show({
            title: t('form.submit-success.title'),
            description: t('form.submit-success.description'),
          });
        },
      },
    );
  };

  const getNameHint = () =>
    errors.name ? t('form.name.errors.required') : undefined;
  const getEmailHint = () =>
    errors.email ? t('form.email.errors.required') : undefined;
  const getMessageHint = () =>
    errors.message ? t('form.message.errors.required') : undefined;

  const formId = 'support-dialog-id';
  return (
    <Dialog
      size="compact"
      title={title}
      onClose={onClose}
      open={open}
      primaryButton={{
        label: t('form.send-button'),
        form: formId,
        type: 'submit',
        loading: submitFormMutation.isLoading,
      }}
      secondaryButton={{
        label: t('form.cancel-button'),
        onClick: onClose,
        form: formId,
        type: 'reset',
        disabled: submitFormMutation.isLoading,
      }}
    >
      <Form id="support-dialog-id" onSubmit={handleSubmit(onSubmit)}>
        {submitFormMutation.isError && (
          <Typography variant="body-2" color="error">
            {t('form.submit-error')}
          </Typography>
        )}
        <Typography variant="body-2">{description}</Typography>
        <TextInput
          hasError={!!errors.name}
          hint={getNameHint()}
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
          hint={getEmailHint()}
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
          hint={getMessageHint()}
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
    row-gap: ${theme.spacing[7]};
  `}
`;

export default SupportDialog;
