import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import { setCustomEnvVariable } from '../../../../utils/custom-env-variable';
import defaultValues from './env-variables.constants';

type FormData = {
  apiBaseUrl: string;
};

const EnvVariables = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });

  const reloadPage = () => {
    window.location.reload();
  };

  const handleBeforeSubmit = (formData: FormData) => {
    setCustomEnvVariable('NEXT_PUBLIC_API_BASE_URL', formData.apiBaseUrl);
    reloadPage();
  };

  return (
    <section>
      <form id="env-variables-form" onSubmit={handleSubmit(handleBeforeSubmit)}>
        <TextInput
          hasError={!!errors.apiBaseUrl}
          hint={errors?.apiBaseUrl?.message}
          label="API Base URL"
          placeholder="https://api.dev.onefootprint.com/"
          type="url"
          {...register('apiBaseUrl', {
            required: {
              value: true,
              message: 'Please enter a valid URL',
            },
          })}
        />
      </form>
    </section>
  );
};

export default EnvVariables;
