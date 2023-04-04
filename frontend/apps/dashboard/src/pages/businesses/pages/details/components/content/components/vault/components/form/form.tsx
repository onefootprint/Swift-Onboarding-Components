import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { VAULT_FORM_ID } from '@/business/constants';

import type { FormData } from '../../vault.types';

export type FormProps = {
  children: React.ReactNode;
  onSubmit: (formData: FormData) => void;
};

const Form = ({ children, onSubmit }: FormProps) => {
  const formMethods = useForm<FormData>();
  const { handleSubmit } = formMethods;

  return (
    <form id={VAULT_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
      <FormProvider {...formMethods}>{children}</FormProvider>
    </form>
  );
};

export default Form;
