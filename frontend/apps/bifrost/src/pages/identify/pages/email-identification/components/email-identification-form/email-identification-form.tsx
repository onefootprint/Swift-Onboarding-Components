import { useTranslation } from 'hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import useIsSandbox from 'src/hooks/use-is-sandbox';
import { UserData, UserDataAttribute } from 'src/utils/state-machine/types';
import styled, { css } from 'styled-components';
import { Button, TextInput } from 'ui';

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
    <Form onSubmit={handleSubmit(onSubmit)} noValidate={isSandbox}>
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
      <Button fullWidth type="submit" loading={isLoading}>
        {t('cta')}
      </Button>
    </Form>
  );
};

const Form = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]}px;
  `}
`;

export default EmailIdentificationForm;
