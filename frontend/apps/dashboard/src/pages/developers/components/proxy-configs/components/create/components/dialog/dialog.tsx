import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronLeftBig24, IcoClose24 } from '@onefootprint/icons';
import { CreateProxyConfigRequest } from '@onefootprint/types';
import { Dialog as FPDialog } from '@onefootprint/ui';
import React, { useEffect, useState } from 'react';

import type { FormData } from '@/proxy-configs/proxy-configs.types';

import FormWizard from './components/form-wizard';
import steps from './constants';
import useCreateProxyConfig from './hooks/use-create-proxy-config';

type DialogProps = {
  defaultValues: FormData;
  onClose: () => void;
  open: boolean;
};

const Dialog = ({ onClose, open, defaultValues }: DialogProps) => {
  const { t, allT } = useTranslation('pages.proxy-configs.create.form');
  const mutation = useCreateProxyConfig();
  const [stepIndex, setStepIndex] = useState(0);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;
  const maxStep = steps.length - 1;
  const { Component, id, canSkip } = steps[stepIndex];

  useEffect(() => {
    if (!open) {
      setStepIndex(0);
    }
  }, [open]);

  const goForward = () => {
    if (stepIndex < maxStep) {
      setStepIndex(prevStep => prevStep + 1);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex(prevStep => prevStep - 1);
    }
  };

  const handleSubmit = (formData: CreateProxyConfigRequest) => {
    mutation.mutate(formData, { onSuccess: onClose });
  };

  return (
    <FPDialog
      closeIconComponent={isFirstStep ? IcoClose24 : IcoChevronLeftBig24}
      onClose={isFirstStep ? onClose : goBack}
      open={open}
      size="compact"
      title={t('title')}
      linkButton={
        canSkip ? { label: allT('skip'), onClick: goForward } : undefined
      }
      primaryButton={{
        form: id,
        label: isLastStep ? allT('save') : allT('next'),
        loading: mutation.isLoading,
        type: 'submit',
      }}
      secondaryButton={{
        disabled: mutation.isLoading,
        label: allT('cancel'),
        onClick: onClose,
      }}
    >
      <FormWizard
        Component={Component}
        defaultValues={defaultValues}
        id={id}
        isLastStep={isLastStep}
        onForward={goForward}
        onSubmit={handleSubmit}
      />
    </FPDialog>
  );
};

export default Dialog;
