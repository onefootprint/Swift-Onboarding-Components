import { STATES } from '@onefootprint/global-constants';
import { Select, TextInput } from '@onefootprint/ui';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type StateFieldProps = {
  inputKind: 'dropdown' | 'text';
};

const StateField = ({ inputKind }: StateFieldProps) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.secure-form.address.form.state',
  });

  return inputKind === 'dropdown' ? (
    <Controller
      control={control}
      name="state"
      rules={{ required: true }}
      render={({ field, fieldState: { error } }) => {
        const value = typeof field.value === 'object' ? field.value : undefined;
        return (
          <Select
            isPrivate
            label={t('label')}
            onBlur={field.onBlur}
            options={STATES}
            onChange={nextOption => {
              field.onChange(nextOption);
            }}
            hint={error && t('error')}
            hasError={!!error}
            placeholder={t('placeholder')}
            value={value}
          />
        );
      }}
    />
  ) : (
    <TextInput
      data-dd-privacy="mask"
      autoComplete="address-level1"
      hasError={!!errors.state}
      hint={errors.state && t('error')}
      label={t('label')}
      placeholder={t('placeholder')}
      {...register('state')}
    />
  );
};

export default StateField;
