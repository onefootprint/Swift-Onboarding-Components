import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  type PersonalInformationAndDocs,
  defaultValues,
  FormData,
} from '../../../../your-playbook.types';
import Preview from './preview';

type FormProps = {
  startingValues: Partial<PersonalInformationAndDocs>;
};

const PreviewWithContext = ({ startingValues }: FormProps) => {
  const formMethods = useForm<FormData>({
    defaultValues: {
      ...defaultValues,
      personalInformationAndDocs: {
        ...defaultValues.personalInformationAndDocs,
        ...startingValues,
      },
    },
  });
  return (
    <FormProvider {...formMethods}>
      <form>
        <Preview startEditing={() => {}} />
      </form>
    </FormProvider>
  );
};

export default PreviewWithContext;
