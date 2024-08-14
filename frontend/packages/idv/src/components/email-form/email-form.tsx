import { isEmail } from '@onefootprint/core';
import { Box, Button, TextInput } from '@onefootprint/ui';
import { useForm } from 'react-hook-form';

export type EmailFormData = { email: string };

export type EmailFormProps = {
  defaultEmail?: string;
  isLoading?: boolean;
  onSubmit: (formData: EmailFormData) => void;
  texts: {
    cta: string;
    email: {
      invalid: string;
      label: string;
      placeholder: string;
      required: string;
    };
  };
};

const EmailForm = ({ defaultEmail, isLoading, onSubmit, texts }: EmailFormProps) => {
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
          data-dd-privacy="mask"
          data-nid-target="email"
          defaultValue={getValues('email')}
          hasError={hasError}
          hint={hint}
          label={texts.email.label}
          placeholder={texts.email.placeholder}
          type="email"
          {...register('email', {
            required: {
              value: true,
              message: texts.email.required,
            },
            validate: (value: string) => {
              if (!isEmail(value)) {
                return texts.email.invalid;
              }
              return true;
            },
          })}
        />
      </Box>
      <Box marginBottom={5}>
        <Button fullWidth loading={isLoading} type="submit" size="large" data-dd-action-name="email:continue">
          {texts.cta}
        </Button>
      </Box>
    </form>
  );
};

export default EmailForm;
