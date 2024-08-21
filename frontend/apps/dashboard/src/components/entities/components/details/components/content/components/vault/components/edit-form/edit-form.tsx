import type React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { EDIT_VAULT_FORM_ID } from '@/entity/constants';

import type { EditFormData } from '../../vault.types';

export type EditFormProps = {
  children: React.ReactNode;
  onSubmit: (formData: EditFormData) => void;
};

const EditForm = ({ children, onSubmit }: EditFormProps) => {
  const formMethods = useForm<EditFormData>();
  const { handleSubmit } = formMethods;

  return (
    <form id={EDIT_VAULT_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
      <FormProvider {...formMethods}>{children}</FormProvider>
    </form>
  );
};

export default EditForm;
