import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  defaultValuesKYB,
  FormData,
} from '../../../../../../your-playbook.types';
import Editing from './editing';

const EditingWithContext = () => {
  const formMethods = useForm<FormData>({ defaultValues: defaultValuesKYB });
  return (
    <FormProvider {...formMethods}>
      <form>
        <Editing stopEditing={() => {}} />
      </form>
    </FormProvider>
  );
};

export default EditingWithContext;
