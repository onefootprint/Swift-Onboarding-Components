import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { SummaryFormData } from '@/playbooks/utils/machine/types';
import { defaultPlaybookValuesKYB } from '@/playbooks/utils/machine/types';

import Editing from './editing';

const EditingWithContext = () => {
  const formMethods = useForm<SummaryFormData>({
    defaultValues: defaultPlaybookValuesKYB,
  });
  return (
    <FormProvider {...formMethods}>
      <form>
        <Editing onStopEditing={() => undefined} />
      </form>
    </FormProvider>
  );
};

export default EditingWithContext;
