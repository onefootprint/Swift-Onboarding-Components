import { useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import type { FormData, StepProps } from '@/proxy-configs/proxy-configs.types';

const Name = ({ id, onSubmit, values }: StepProps) => {
  const { t } = useTranslation('pages.proxy-configs.create.form');
  const { handleSubmit, register, formState } = useForm<FormData>({
    defaultValues: {
      name: values.name,
    },
  });

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)}>
      <TextInput
        autoFocus
        hasError={!!formState.errors.name}
        hint={formState.errors.name?.message}
        label={t('name.label')}
        placeholder={t('name.placeholder')}
        {...register('name', {
          required: {
            value: true,
            message: t('name.errors.required'),
          },
        })}
      />
    </form>
  );
};

export default Name;
