import { useTranslation } from '@onefootprint/hooks';
import { UserData, UserDataAttribute } from '@onefootprint/types';
import { Box, Button, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

export type FormData = Required<Pick<UserData, UserDataAttribute.email>>;

export type EmailIdentificationFormProps = {
  defaultEmail?: string;
  isLoading?: boolean;
  onSubmit: (formData: FormData) => void;
};

const EmailIdentificationForm = ({
  defaultEmail,
  isLoading,
  onSubmit,
}: EmailIdentificationFormProps) => {
  const { t } = useTranslation('pages.email-identification.form');
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { email: defaultEmail } });
  const hasError = !!errors[UserDataAttribute.email];
  const hint = hasError ? errors[UserDataAttribute.email]?.message : undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ marginBottom: 7 }}>
        <TextInput
          data-private
          hasError={hasError}
          hint={hint}
          label={t('email.label')}
          placeholder={t('email.placeholder')}
          type="email"
          defaultValue={getValues(UserDataAttribute.email)}
          {...register(UserDataAttribute.email, {
            required: {
              value: true,
              message: t('email.errors.required'),
            },
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
