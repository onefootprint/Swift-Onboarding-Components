import type { CountryRecord } from '@onefootprint/global-constants';
import { IcoSmartphone224 } from '@onefootprint/icons';
import type { L10n } from '@onefootprint/types';
import { Button, Grid, PhoneInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

type PhoneFormData = { phoneNumber: string };
type PhoneFormProps = {
  defaultPhone?: string;
  isLoading?: boolean;
  l10n?: L10n;
  onSubmit: (formData: PhoneFormData) => void;
  options?: CountryRecord[];
  validator?: (phone: string) => boolean;
  texts: {
    cta: string;
    phoneInvalid: string;
    phoneLabel: string;
    phoneRequired: string;
  };
};

const PhoneForm = ({ defaultPhone, isLoading, l10n, onSubmit, options, texts, validator }: PhoneFormProps) => {
  const {
    control,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PhoneFormData>({ defaultValues: { phoneNumber: defaultPhone } });
  const hasError = !!errors.phoneNumber;
  const hint = hasError ? errors.phoneNumber?.message : undefined;

  const handleBeforeSubmit = (formData: PhoneFormData) => {
    if (validator && !validator(formData.phoneNumber)) {
      setError('phoneNumber', { message: texts.phoneInvalid }, { shouldFocus: true });
      return;
    }
    onSubmit(formData);
  };

  return (
    <Grid.Container
      tag="form"
      gap={7} // "gap" is being sent through to the DOM
      onSubmit={handleSubmit(handleBeforeSubmit)}
    >
      <Controller
        control={control}
        name="phoneNumber"
        rules={{
          required: {
            value: true,
            message: texts.phoneRequired,
          },
        }}
        render={({ field: { onChange, onBlur, value, name }, fieldState: { error } }) => (
          <PhoneInput
            autoFocus
            data-nid-target="phone-number"
            data-private
            data-dd-privacy="mask"
            hasError={!!error}
            hint={hint}
            label={texts.phoneLabel}
            locale={l10n?.locale}
            name={name}
            onBlur={onBlur}
            onChange={onChange}
            onReset={() => {
              setValue('phoneNumber', '');
            }}
            options={options}
            value={value}
          />
        )}
      />
      <Button
        fullWidth
        loading={isLoading}
        type="submit"
        prefixIcon={IcoSmartphone224}
        size="large"
        data-dd-action-name="phone:continue"
      >
        {texts.cta}
      </Button>
    </Grid.Container>
  );
};

export default PhoneForm;
