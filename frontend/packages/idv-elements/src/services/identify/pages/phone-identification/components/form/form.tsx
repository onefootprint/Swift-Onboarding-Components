import type { CountryRecord } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Button, PhoneInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useL10nContext } from '../../../../../../components/l10n-provider';

type FormData = { phoneNumber: string };

export type FormProps = {
  defaultPhone?: string;
  isLoading?: boolean;
  onSubmit: (formData: FormData) => void;
  validator?: (phone: string) => boolean;
  options?: CountryRecord[];
};

const Form = ({
  defaultPhone,
  isLoading,
  onSubmit,
  validator,
  options,
}: FormProps) => {
  const { t } = useTranslation('pages.phone-identification.form');
  const {
    control,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { phoneNumber: defaultPhone } });
  const l10n = useL10nContext();
  const hasError = !!errors.phoneNumber;
  const hint = hasError ? errors.phoneNumber?.message : undefined;

  const handleBeforeSubmit = (formData: FormData) => {
    if (validator && !validator(formData.phoneNumber)) {
      setError(
        'phoneNumber',
        { message: t('phone.errors.invalid') },
        { shouldFocus: true },
      );
      return;
    }
    onSubmit(formData);
  };

  return (
    <StyledForm onSubmit={handleSubmit(handleBeforeSubmit)}>
      <Controller
        control={control}
        name="phoneNumber"
        rules={{
          required: {
            value: true,
            message: t('phone.errors.required'),
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
            locale={l10n?.locale}
            onReset={() => {
              setValue('phoneNumber', '');
            }}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            options={options}
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
