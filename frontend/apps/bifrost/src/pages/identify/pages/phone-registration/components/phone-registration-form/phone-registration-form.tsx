import { useTranslation } from 'hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import useIsSandbox from 'src/hooks/use-is-sandbox';
import styled, { css } from 'styled-components';
import { Button, PhoneInput } from 'ui';

import {
  PHONE_REGEX,
  PHONE_SANDBOX_REGEX,
} from './phone-registration-form.constants';

type FormData = {
  phone: string;
};

type PhoneRegistrationFormProps = {
  isLoading: boolean;
  onSubmit: (formData: FormData) => void;
};

const PhoneRegistrationForm = ({
  isLoading,
  onSubmit,
}: PhoneRegistrationFormProps) => {
  const isSandbox = useIsSandbox();
  const { t } = useTranslation('pages.phone-registration.form');
  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const getHintText = () => {
    if (errors.phone) {
      return errors.phone.message;
    }
    return isSandbox ? t('phone.hint') : undefined;
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <PhoneInput
        disableMask={isSandbox}
        hasError={!!errors.phone}
        hintText={getHintText()}
        label={t('phone.label')}
        placeholder={t('phone.placeholder')}
        onReset={() => {
          setValue('phone', '');
        }}
        {...register('phone', {
          required: {
            value: true,
            message: t('phone.errors.required'),
          },
          pattern: isSandbox
            ? {
                value: PHONE_SANDBOX_REGEX,
                message: t('phone.errors.sandbox-pattern'),
              }
            : {
                value: PHONE_REGEX,
                message: t('phone.errors.pattern'),
              },
        })}
      />
      <Button fullWidth loading={isLoading} type="submit">
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

export default PhoneRegistrationForm;
