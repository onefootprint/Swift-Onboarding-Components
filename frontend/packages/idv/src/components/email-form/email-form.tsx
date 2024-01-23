import { Box, Button, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

export type EmailFormData = { email: string };
export type EmailFormProps = {
  defaultEmail?: string;
  isLoading?: boolean;
  onSubmit: (formData: EmailFormData) => void;
  texts: {
    cta: string;
    emailIsRequired: string;
    emailLabel: string;
    emailPlaceholder: string;
  };
};

const EmailForm = ({
  defaultEmail,
  isLoading,
  onSubmit,
  texts,
}: EmailFormProps) => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<EmailFormData>({ defaultValues: { email: defaultEmail } });
  const hasError = !!errors.email;
  const hint = hasError ? errors.email?.message : undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box marginBottom={7} marginTop={5}>
        <TextInput
          autoFocus
          data-private
          defaultValue={getValues('email')}
          hasError={hasError}
          hint={hint}
          label={texts.emailLabel}
          placeholder={texts.emailPlaceholder}
          type="email"
          {...register('email', {
            required: {
              value: true,
              message: texts.emailIsRequired,
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
        {texts.cta}
      </Button>
    </form>
  );
};

export default EmailForm;
