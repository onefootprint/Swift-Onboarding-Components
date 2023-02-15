import { useTranslation } from '@onefootprint/hooks';
import { UserDataAttribute } from '@onefootprint/types';
import { Button, PhoneInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import {
  PHONE_REGEX,
  PHONE_SANDBOX_REGEX,
} from './phone-registration-form.constants';

type FormData = {
  [UserDataAttribute.phoneNumber]: string;
};

export type PhoneRegistrationFormProps = {
  defaultPhone?: string;
  isLoading?: boolean;
  isSandbox?: boolean;
  onSubmit: (formData: FormData) => void;
};

const PhoneRegistrationForm = ({
  isLoading,
  defaultPhone,
  isSandbox,
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

  const getHint = () => {
    const hasError = !!errors?.[UserDataAttribute.phoneNumber];
    if (hasError) {
      return errors[UserDataAttribute.phoneNumber]?.message;
    }
    return isSandbox ? t('phone.hint') : undefined;
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <PhoneInput
        data-private
        disableMask={isSandbox}
        hasError={!!errors[UserDataAttribute.phoneNumber]}
        hint={getHint()}
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
    row-gap: ${theme.spacing[7]};
  `}
`;

export default PhoneRegistrationForm;
