import { useTranslation } from '@onefootprint/hooks';
import {
  CreateRoleRequest,
  RoleScope,
  UpdateRoleRequest,
} from '@onefootprint/types';
import { Box, TextInput } from '@onefootprint/ui';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import Permissions from './components/permissions';
import type { FormData } from './form.types';

export type FormProps = {
  defaultValues?: FormData;
  onSubmit: (payload: CreateRoleRequest | UpdateRoleRequest) => void;
};

const Form = ({
  onSubmit,
  defaultValues = {
    name: '',
    scopes: [],
    showDecrypt: false,
    decryptFields: [],
  },
}: FormProps) => {
  const { t } = useTranslation('pages.settings.roles.form');
  const formMethods = useForm<FormData>({ defaultValues });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = formMethods;

  const handleAfterSubmit = (formData: FormData) => {
    const { name, scopes, decryptFields } = formData;
    const decryptScopes = decryptFields.map(({ value }) => value);
    const allScopes = [
      ...new Set<RoleScope>([RoleScope.read, ...scopes, ...decryptScopes]),
    ];
    onSubmit({
      name,
      scopes: allScopes,
    });
  };

  return (
    <FormProvider {...formMethods}>
      <form id="roles-form" onSubmit={handleSubmit(handleAfterSubmit)}>
        <Box sx={{ marginBottom: 8 }}>
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
