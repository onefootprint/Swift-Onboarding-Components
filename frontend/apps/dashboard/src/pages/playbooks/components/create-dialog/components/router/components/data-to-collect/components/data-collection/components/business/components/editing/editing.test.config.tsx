import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { DataToCollectFormData } from '@/playbooks/utils/machine/types';
import { defaultPlaybookValuesKYB } from '@/playbooks/utils/machine/types';

import Editing from './editing';

const EditingWithContext = () => {
  const formMethods = useForm<DataToCollectFormData>({
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
