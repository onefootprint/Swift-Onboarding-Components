import { Grid, Text, TextArea, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { ContactDialogData } from '../../contact-dialog.types';
import { FormField } from '../../contact-dialog.types';

type FormProps = {
  onSubmit: (data: ContactDialogData) => void;
};

const Form = ({ onSubmit }: FormProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.contact-us-dialog',
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactDialogData>();
  const getNameHint = () =>
    errors[FormField.name] ? t('name.errors.required') : undefined;
  const getEmailHint = () =>
    errors[FormField.email] ? t('email.errors.required') : undefined;
  const getMessageHint = () =>
    errors[FormField.message] ? t('message.errors.required') : undefined;
  const formId = 'support-dialog-id';

  return (
    <Grid.Container
      gap={7}
      id={formId}
      tag="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Text variant="body-2">{t('description')}</Text>
      <TextInput
        hasError={!!errors[FormField.name]}
        hint={getNameHint()}
        label={t('name.label')}
        placeholder={t('name.placeholder')}
        type="text"
        {...register(FormField.name, {
          required: {
            value: true,
            message: t('name.errors.required'),
          },
        })}
      />
      <TextInput
        hasError={!!errors[FormField.email]}
        hint={getEmailHint()}
        label={t('email.label')}
        placeholder={t('email.placeholder')}
        type="email"
        {...register(FormField.email, {
          required: {
            value: true,
            message: t('email.errors.required'),
          },
        })}
      />
      <TextInput
        hasError={!!errors[FormField.company]}
        hint={getEmailHint()}
        label={t('company.label')}
        placeholder={t('company.placeholder')}
        type="company"
        {...register(FormField.company, {
          required: {
            value: true,
            message: t('company.errors.required'),
          },
        })}
      />
      <TextArea
        hasError={!!errors[FormField.message]}
        hint={getMessageHint()}
        label={t('message.label')}
        placeholder={t('message.placeholder')}
        {...register(FormField.message, {
          required: {
            value: false,
            message: t('message.errors.required'),
          },
        })}
      />
    </Grid.Container>
  );
};

export default Form;
