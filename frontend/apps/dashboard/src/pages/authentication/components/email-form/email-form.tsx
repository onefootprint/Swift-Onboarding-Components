import { Button, Stack, TextInput } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import useEmailLogin from './hooks/use-email-login';

type FormData = {
  email: string;
};

const EmailForm = () => {
  const { t } = useTranslation('authentication', { keyPrefix: 'email' });
  const router = useRouter();
  const mutateLoginEmail = useEmailLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = ({ email }: FormData) => {
    mutateLoginEmail.mutate(
      {
        emailAddress: email,
        redirectUrl: `${window.location.origin}/auth`,
      },
      {
        onSuccess() {
          router.push({
            pathname: '/authentication/link-sent',
            query: { email },
          });
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" gap={4}>
        <TextInput
          autoComplete="email"
          hasError={!!errors.email}
          hint={errors?.email?.message}
          label={t('form.email.label')}
          placeholder={t('form.email.placeholder')}
          type="email"
          {...register('email', { required: t('form.email.errors.required') })}
        />
        <Button fullWidth loading={mutateLoginEmail.isLoading} size="large" type="submit">
          {t('cta')}
        </Button>
      </Stack>
    </form>
  );
};

export default EmailForm;
