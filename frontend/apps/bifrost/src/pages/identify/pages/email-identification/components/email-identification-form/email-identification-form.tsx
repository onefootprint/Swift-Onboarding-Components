import { useTranslation } from 'hooks';
import Link from 'next/link';
import React from 'react';
import { useForm } from 'react-hook-form';
import useIsSandbox from 'src/hooks/use-is-sandbox';
import { UserData } from 'src/utils/state-machine/types';
import { UserDataAttribute } from 'types';
import { Box, Button, TextInput, Typography } from 'ui';

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
  const isSandbox = useIsSandbox();
  const { t } = useTranslation('pages.email-identification.form');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const getHintText = () => {
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
          hintText={getHintText()}
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
      <Typography
        color="tertiary"
        sx={{ textAlign: 'center' }}
        variant="caption-1"
      >
        {t('terms.label')}&nbsp;
        <Link
          href="https://www.onefootprint.com/terms-of-service"
          target="_blank"
          rel="noreferrer noopener"
        >
          {t('terms.link')}
        </Link>
      </Typography>
    </form>
  );
};

export default EmailIdentificationForm;
