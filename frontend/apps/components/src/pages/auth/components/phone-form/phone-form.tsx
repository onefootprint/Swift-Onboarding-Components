import type { CountryRecord } from '@onefootprint/global-constants';
import { Button, Grid, PhoneInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

type EmailFormData = { phoneNumber: string };
type PhoneFormProps = {
  defaultPhone?: string;
  isLoading?: boolean;
  onSubmit: (formData: EmailFormData) => void;
  options?: CountryRecord[];
  validator?: (phone: string) => boolean;
  texts: {
    cta: string;
    phoneInvalid: string;
    phoneLabel: string;
    phoneRequired: string;
  };
};

const PhoneForm = ({
  defaultPhone,
  isLoading,
  onSubmit,
  options,
  texts,
  validator,
}: PhoneFormProps) => {
  const {
    control,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<EmailFormData>({ defaultValues: { phoneNumber: defaultPhone } });
  const hasError = !!errors.phoneNumber;
  const hint = hasError ? errors.phoneNumber?.message : undefined;

  const handleBeforeSubmit = (formData: EmailFormData) => {
    if (validator && !validator(formData.phoneNumber)) {
      setError(
        'phoneNumber',
        { message: texts.phoneInvalid },
        { shouldFocus: true },
      );
      return;
    }
    onSubmit(formData);
  };

  return (
    <Grid.Container
      as="form"
      gap={7}
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
        render={({
          field: { onChange, onBlur, value, name },
          fieldState: { error },
        }) => (
          <PhoneInput
            autoFocus
            data-private
            hasError={!!error}
            hint={hint}
            label={texts.phoneLabel}
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
      <Button fullWidth loading={isLoading} type="submit">
        {texts.cta}
      </Button>
    </Grid.Container>
  );
};

export default PhoneForm;
