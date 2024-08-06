import type { CreateProxyConfigRequest } from '@onefootprint/types';
import { useState } from 'react';
import type { FormData, StepProps } from 'src/pages/proxy-configs/proxy-configs.types';

import createPayload from './utils/create-payload';

type FormWizardProps = {
  Component: (step: StepProps) => JSX.Element;
  defaultValues: FormData;
  id: string;
  isLastStep: boolean;
  onForward: () => void;
  onSubmit: (formData: CreateProxyConfigRequest) => void;
};

const FormWizard = ({ Component, defaultValues, id, isLastStep, onSubmit, onForward }: FormWizardProps) => {
  const [formData, setFormData] = useState<FormData>(defaultValues);

  const handleSubmit = (newData: FormData) => {
    setFormData(prevData => ({ ...prevData, ...newData }));
    if (isLastStep) {
      const payload = createPayload({ ...formData, ...newData });
      onSubmit(payload);
    } else {
      onForward();
    }
  };

  return <Component id={id} onSubmit={handleSubmit} values={formData} />;
};

export default FormWizard;
