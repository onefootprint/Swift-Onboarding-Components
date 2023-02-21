import { useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
import { Button, PhoneInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import PHONE_REGEX from './phone-registration-form.constants';

type FormData = {
  [UserDataAttribute.phoneNumber]: string;
};

export type PhoneRegistrationFormProps = {
  defaultPhone?: string;
  isLoading?: boolean;
  onSubmit: (formData: FormData) => void;
};

const PhoneRegistrationForm = ({
  isLoading,
  defaultPhone,
  onSubmit,
}: PhoneRegistrationFormProps) => {
  const { t } = useTranslation('pages.phone-registration.form');
  const {
    setValue,
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      [UserDataAttribute.phoneNumber]: defaultPhone,
    },
  });
  const hasError = !!errors[UserDataAttribute.phoneNumber];
  const hint = hasError
    ? errors[UserDataAttribute.phoneNumber]?.message
    : undefined;

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <PhoneInput
        data-private
        hasError={hasError}
        hint={hint}
        label={t('phone.label')}
        placeholder={t('phone.placeholder')}
        onReset={() => {
          setValue(UserDataAttribute.phoneNumber, '');
        }}
        value={getValues(UserDataAttribute.phoneNumber)}
        {...register(UserDataAttribute.phoneNumber, {
          required: {
            value: true,
            message: t('phone.errors.required'),
          },
          pattern: {
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
    row-gap: ${theme.spacing[7]};
  `}
`;

export default PhoneRegistrationForm;
