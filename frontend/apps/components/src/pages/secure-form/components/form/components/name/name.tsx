import { useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

export type NameData = {
  name: string;
};

export type NameProps = {
  label?: string;
};

const Name = ({ label }: NameProps) => {
  const { t } = useTranslation('pages.secure-form.name.form');
  const {
    register,
    formState: { errors },
  } = useFormContext<NameData>();

  return (
    <TextInput
      data-private
      hasError={!!errors.name}
      hint={errors.name?.message}
      label={label ?? t('label')}
      placeholder={t('placeholder')}
      {...register('name', {
        required: {
          value: true,
          message: t('error'),
        },
      })}
    />
  );
};

export default Name;
