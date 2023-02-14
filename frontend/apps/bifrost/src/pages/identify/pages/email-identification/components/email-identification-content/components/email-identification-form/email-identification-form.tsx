import { useTranslation } from '@onefootprint/hooks';
import { UserData, UserDataAttribute } from '@onefootprint/types';
import { Box, Button, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import EMAIL_SANDBOX_REGEX from './email-identification-form.constants';

export type FormData = Required<Pick<UserData, UserDataAttribute.email>>;

export type EmailIdentificationFormProps = {
  defaultEmail?: string;
  isLoading?: boolean;
  isSandbox?: boolean;
  onSubmit: (formData: FormData) => void;
};

const EmailIdentificationForm = ({
  defaultEmail,
  isLoading,
  isSandbox,
  onSubmit,
}: EmailIdentificationFormProps) => {
  const { t } = useTranslation('pages.email-identification.form');
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { email: defaultEmail } });

  const getHint = () => {
    const hasError = !!errors?.[UserDataAttribute.email];
    if (hasError) {
      return errors[UserDataAttribute.email]?.message;
    }
    return isSandbox ? t('email.hint') : undefined;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate={isSandbox}>
      <Box sx={{ marginBottom: 7 }}>
        <TextInput
          data-private
          hasError={!!errors.email}
          hint={getHint()}
          label={t('email.label')}
          placeholder={t('email.placeholder')}
          type="email"
          defaultValue={getValues(UserDataAttribute.email)}
          {...register(UserDataAttribute.email, {
            required: {
              value: true,
              message: t('email.errors.required'),
            },
            pattern: isSandbox
              ? {
                  value: EMAIL_SANDBOX_REGEX,
                  message: t('email.errors.pattern'),
                }
              : undefined,
          })}
        />
      </Box>
      <Button
        fullWidth
        loading={isLoading}
        sx={{ marginBottom: 5 }}
        type="submit"
      >
        {t('cta')}
      </Button>
    </form>
  );
};

export default EmailIdentificationForm;
