import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  defaultValues,
  FormData,
  Kind,
} from '../../../../../../your-playbook.types';
import Editing from './editing';

export type EditingWithContextProps = {
  kind?: Kind;
};

const EditingWithContext = ({ kind }: EditingWithContextProps) => {
  const formMethods = useForm<FormData>({ defaultValues });
  return (
    <FormProvider {...formMethods}>
      <form>
        <Editing stopEditing={() => {}} kind={kind ?? Kind.KYC} />
      </form>
    </FormProvider>
  );
};

export default EditingWithContext;
