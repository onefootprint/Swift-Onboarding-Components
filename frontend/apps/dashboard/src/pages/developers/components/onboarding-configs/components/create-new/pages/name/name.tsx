import { useTranslation } from '@onefootprint/hooks';
import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import { useOnboardingConfigMachine } from '../../components/machine-provider';
import getFormIdForState from '../../utils/get-form-id-for-state';

type FormData = {
  name: string;
};

const Name = () => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.create-new.name-form',
  );
  const [state, send] = useOnboardingConfigMachine();
  const { name } = state.context;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { name },
  });

  const onSubmit = (data: FormData) => {
    send({
      type: 'nameSubmitted',
      payload: {
        name: data.name,
      },
    });
  };

  return (
    <form
      data-testid={getFormIdForState(state.value)}
      id={getFormIdForState(state.value)}
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

export default Name;
