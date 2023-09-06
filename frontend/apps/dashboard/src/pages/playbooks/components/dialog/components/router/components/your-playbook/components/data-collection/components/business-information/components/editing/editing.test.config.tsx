import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { PlaybookFormData } from '@/playbooks/utils/machine/types';
import { defaultPlaybookValuesKYB } from '@/playbooks/utils/machine/types';

import Editing from './editing';

const EditingWithContext = () => {
  const formMethods = useForm<PlaybookFormData>({
    defaultValues: defaultPlaybookValuesKYB,
  });
  return (
    <FormProvider {...formMethods}>
      <form>
        <Editing stopEditing={() => {}} />
      </form>
    </FormProvider>
  );
};

export default EditingWithContext;
