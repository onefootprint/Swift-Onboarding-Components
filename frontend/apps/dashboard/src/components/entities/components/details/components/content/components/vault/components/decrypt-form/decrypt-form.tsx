import type React from 'react';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { DECRYPT_VAULT_FORM_ID } from '@/entity/constants';

import type { DecryptFormData } from '../../vault.types';
import { useDecryptControls } from '../vault-actions';

export type DecryptFormProps = {
  children: React.ReactNode;
  onSubmit: (formData: DecryptFormData) => void;
};

const DecryptForm = ({ children, onSubmit }: DecryptFormProps) => {
  const formMethods = useForm<DecryptFormData>();
  const { handleSubmit, reset } = formMethods;
  const decryptControls = useDecryptControls();

  useEffect(() => {
    if (decryptControls.isIdle) {
      reset();
    }
  }, [decryptControls.isIdle]);

  return (
    <form id={DECRYPT_VAULT_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
      <FormProvider {...formMethods}>{children}</FormProvider>
    </form>
  );
};

export default DecryptForm;
