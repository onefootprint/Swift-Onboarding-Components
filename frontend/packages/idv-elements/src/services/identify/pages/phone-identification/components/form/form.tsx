import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, PhoneInput, PhoneInputRegex } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

type FormData = {
  phoneNumber: string;
};

export type FormProps = {
  defaultPhone?: string;
  isLoading?: boolean;
  onSubmit: (formData: FormData) => void;
};

const Form = ({ isLoading, defaultPhone, onSubmit }: FormProps) => {
  const { t } = useTranslation('pages.phone-identification.form');
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      phoneNumber: defaultPhone,
    },
  });
  const hasError = !!errors.phoneNumber;
  const hint = hasError ? errors.phoneNumber?.message : undefined;

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)}>
      <Controller
        control={control}
        name="phoneNumber"
        rules={{
          required: {
            value: true,
            message: t('phone.errors.required'),
          },
          pattern: {
            value: PhoneInputRegex,
            message: t('phone.errors.pattern'),
          },
        }}
        render={({
          field: { onChange, onBlur, value, name },
          fieldState: { error },
        }) => (
          <PhoneInput
            name={name}
            data-private
            hasError={!!error}
            hint={hint}
            label={t('phone.label')}
            onReset={() => {
              setValue('phoneNumber', '');
            }}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
          />
        )}
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
