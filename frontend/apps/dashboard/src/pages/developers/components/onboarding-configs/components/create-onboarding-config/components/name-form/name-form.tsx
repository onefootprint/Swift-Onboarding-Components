import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import { useForm } from 'react-hook-form';
import { TextInput } from 'ui';

import type { NameFormData } from '../../create-onboarding-config.types';

type NameFormProps = {
  defaultValues?: NameFormData;
  onSubmit: (formData: NameFormData) => void;
};

const NameForm = ({ defaultValues, onSubmit }: NameFormProps) => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.create.name-form',
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NameFormData>({
    defaultValues,
  });

  return (
    <form
      data-testid="name-form"
      id="name-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <TextInput
        autoFocus
        hasError={!!errors.name}
        hint={errors?.name?.message}
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

export default NameForm;
