import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronLeftBig24, IcoClose24 } from '@onefootprint/icons';
import { CreateProxyConfigRequest } from '@onefootprint/types';
import { Dialog as FPDialog } from '@onefootprint/ui';
import React, { useState } from 'react';

import { PROXY_FORM_ID } from '@/proxy-configs/constants';

import * as stepComponents from './components';
import useCreateProxyConfig from './hooks/use-create-proxy-config';

const steps = [
  { id: 'name', Step: stepComponents.Name },
  { id: 'base-config', Step: stepComponents.BaseConfiguration },
  { id: 'custom-header', Step: stepComponents.CustomHeaderValues },
  { id: 'client-certificates', Step: stepComponents.ClientCertificates },
  { id: 'server-certificates', Step: stepComponents.PinnedServerCertificates },
  { id: 'ingress-vaulting', Step: stepComponents.IngressVaulting },
];

type DialogProps = {
  onClose: () => void;
  open: boolean;
};

const Dialog = ({ onClose, open }: DialogProps) => {
  const { t, allT } = useTranslation('pages.proxy-configs.create.form');
  const mutation = useCreateProxyConfig();
  const [step, setStep] = useState(0);
  const isFirstStep = step === 0;
  const isLastStep = step === steps.length - 1;

  const handleSubmit = (proxyConfig: CreateProxyConfigRequest) => {
    mutation.mutate(proxyConfig, { onSuccess: onClose });
  };

  const goBack = () => {
    setStep(currentStep => currentStep - 1);
  };

  const goNext = () => {
    if (!isLastStep) {
      setStep(currentStep => currentStep + 1);
    }
  };

  return (
    <FPDialog
      size="compact"
      title={t('title')}
      onClose={isFirstStep ? onClose : goBack}
      closeIconComponent={isFirstStep ? IcoClose24 : IcoChevronLeftBig24}
      open={open}
      primaryButton={{
        form: PROXY_FORM_ID,
        label: isLastStep ? allT('save') : allT('next'),
        loading: mutation.isLoading,
        type: isLastStep ? 'submit' : 'button',
        onClick: goNext,
      }}
      secondaryButton={{
        label: allT('cancel'),
        disabled: mutation.isLoading,
        onClick: onClose,
      }}
    >
      <form onSubmit={handleSubmit}>
        {steps.map(
          ({ Step, id }, index) => step === index && <Step key={id} />,
        )}
      </form>
    </FPDialog>
  );
};

export default Dialog;
