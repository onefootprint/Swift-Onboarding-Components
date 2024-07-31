import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { ResidencyFormData } from '@/playbooks/utils/machine/types';
import { defaultResidencyFormData } from '@/playbooks/utils/machine/types';

import Residency from './step-residency';

export type ResidencyFormWithContextProps = {
  onSubmit: (data: ResidencyFormData) => void;
  onBack: () => void;
  defaultValues?: ResidencyFormData;
};

const ResidencyFormWithContext = ({ onSubmit, onBack, defaultValues }: ResidencyFormWithContextProps) => {
  const formMethods = useForm<ResidencyFormData>({
    defaultValues: defaultResidencyFormData,
  });

  const defaultResidencyValues = {
    ...defaultResidencyFormData,
    ...defaultValues,
  };

  return (
    <FormProvider {...formMethods}>
      <Residency onBack={onBack} onSubmit={onSubmit} defaultValues={defaultResidencyValues} />
    </FormProvider>
  );
};

export default ResidencyFormWithContext;
