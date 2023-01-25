import { useTranslation } from '@onefootprint/hooks';
import { Box, TextInput } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Permissions from './components/permissions';

// TODO: Add permissions once toggle integration works
type FormData = {
  name: string;
};

export type FormProps = {
  onSubmit: (formData: FormData) => void;
};

const Form = ({ onSubmit }: FormProps) => {
  const { t } = useTranslation('pages.settings.roles.create.form');
  const formMethods = useForm<FormData>({
    defaultValues: {
      name: '',
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  return (
    <FormProvider {...formMethods}>
      <form id="role-create-form" onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ marginBottom: 9 }}>
          <TextInput
            autoFocus
            hasError={!!errors.name}
            hint={errors.name?.message}
            label={t('name.label')}
            placeholder={t('name.placeholder')}
            {...register('name', {
              required: {
                value: true,
                message: t('name.errors.required'),
              },
            })}
          />
        </Box>
        <Permissions />
      </form>
    </FormProvider>
  );
};

export default Form;
