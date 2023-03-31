import { useTranslation } from '@onefootprint/hooks';
import { Box, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import { FormData } from '../form-data.types';

export type NameFormProps = {
  id: string;
  onSubmit: (formData: FormData) => void;
  defaultValues: FormData;
};

const NameForm = ({ id, onSubmit, defaultValues }: NameFormProps) => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.details.name',
  );
  const { handleSubmit, register, formState } = useForm<FormData>({
    defaultValues,
  });

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ display: 'grid', gap: 7 }}>
        <TextInput
          testID="name-input"
          autoFocus
          hasError={!!formState.errors.name}
          hint={formState.errors.name?.message}
          label={t('label')}
          placeholder={t('placeholder')}
          {...register('name', {
            required: {
              value: true,
              message: t('errors.required'),
            },
          })}
        />
      </Box>
    </form>
  );
};

export default NameForm;
