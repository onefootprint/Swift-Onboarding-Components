import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DECRYPT_VAULT_FORM_ID } from '@/entity/constants';

import type { DecryptFormData } from '../../vault.types';

export type DecryptFormProps = {
  children: React.ReactNode;
  onSubmit: (formData: DecryptFormData) => void;
};

const DecryptForm = ({ children, onSubmit }: DecryptFormProps) => {
  const formMethods = useForm<DecryptFormData>();
  const { handleSubmit } = formMethods;

  return (
    <form id={DECRYPT_VAULT_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
      <FormProvider {...formMethods}>{children}</FormProvider>
    </form>
  );
};

export default DecryptForm;
