import { Dialog, Grid, Text, TextArea, TextInput, useToast } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import useSupportForm, { FormField, SupportFormData } from '../../hooks/use-support-form';

type SupportDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
};

const GET_FORM_URL = 'https://getform.io/f/pbgxoqza';

const SupportDialog = ({ title, description, open, onClose }: SupportDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.support-dialog',
  });
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
  }, [open]);

  const onSubmit = (data: SupportFormData) => {
    submitFormMutation.mutate(
      { url: GET_FORM_URL, data },
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

  const getNameHint = () => (errors.name ? t('form.name.errors.required') : undefined);
  const getEmailHint = () => (errors.email ? t('form.email.errors.required') : undefined);
  const getMessageHint = () => (errors.message ? t('form.message.errors.required') : undefined);

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
      <Grid.Container tag="form" gap={7} id="support-dialog-id" onSubmit={handleSubmit(onSubmit)}>
        {submitFormMutation.isError && (
          <Text variant="body-2" color="error">
            {t('form.submit-error')}
          </Text>
        )}
        <Text variant="body-2">{description}</Text>
        <TextInput
          hasError={!!errors.name}
          hint={getNameHint()}
          label={t('form.name.label')}
          placeholder={t('form.name.placeholder')}
          type="text"
          {...register(FormField.name, {
            required: {
              value: true,
              message: t('form.name.errors.required'),
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
              message: t('form.email.errors.required'),
            },
          })}
        />
        <TextArea
          hasError={!!errors.message}
          hint={getMessageHint()}
          label={t('form.message.label')}
          placeholder={t('form.message.placeholder')}
          {...register(FormField.message, {
            required: {
              value: true,
              message: t('form.message.errors.required'),
            },
          })}
        />
      </Grid.Container>
    </Dialog>
  );
};

export default SupportDialog;
