import { useTranslation } from '@onefootprint/hooks';
import { UserData, UserDataAttribute } from '@onefootprint/types';
import { Box, Button, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import useSandboxMode from 'src/hooks/use-sandbox-mode';

import useIdentifyMachine from '../../../../../../hooks/use-identify-machine';
import EMAIL_SANDBOX_REGEX from './email-identification-form.constants';

type FormData = Required<Pick<UserData, UserDataAttribute.email>>;

type EmailIdentificationFormProps = {
  isLoading: boolean;
  onSubmit: (formData: FormData) => void;
};

const EmailIdentificationForm = ({
  isLoading,
  onSubmit,
}: EmailIdentificationFormProps) => {
  const [state] = useIdentifyMachine();
  const { email } = state.context;
  const { isSandbox } = useSandboxMode();
  const { t } = useTranslation('pages.email-identification.form');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { email } });

  const getHint = () => {
    if (errors.email) {
      return errors.email.message;
    }
    return isSandbox ? t('email.hint') : undefined;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate={isSandbox}>
      <Box sx={{ marginBottom: 7 }}>
        <TextInput
          hasError={!!errors.email}
          hint={getHint()}
          label={t('email.label')}
          placeholder={t('email.placeholder')}
          type="email"
          {...register('email', {
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
