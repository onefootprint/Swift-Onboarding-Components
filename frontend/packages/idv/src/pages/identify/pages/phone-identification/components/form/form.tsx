import { useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
import { Button, PhoneInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import PHONE_REGEX from './constants';

type FormData = {
  [UserDataAttribute.phoneNumber]: string;
};

export type FormProps = {
  defaultPhone?: string;
  isLoading?: boolean;
  onSubmit: (formData: FormData) => void;
};

const Form = ({ isLoading, defaultPhone, onSubmit }: FormProps) => {
  const { t } = useTranslation('pages.identify.phone-identification.form');
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
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
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
    </StyledForm>
  );
};

const StyledForm = styled.form`
  ${({ theme }) => css`
    display: grid;
    row-gap: ${theme.spacing[7]};
  `}
`;

export default Form;
