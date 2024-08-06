import { IcoChevronLeftBig24, IcoClose24 } from '@onefootprint/icons';
import type { CreateProxyConfigRequest } from '@onefootprint/types';
import { Dialog as FPDialog, useConfirmationDialog } from '@onefootprint/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FormData } from 'src/pages/proxy-configs/proxy-configs.types';

import FormWizard from './components/form-wizard';
import steps from './constants';
import useCreateProxyConfig from './hooks/use-create-proxy-config';

type DialogProps = {
  defaultValues: FormData;
  onClose: () => void;
  open: boolean;
};

const Dialog = ({ onClose, open, defaultValues }: DialogProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.proxy-configs.create.form',
  });
  const mutation = useCreateProxyConfig();
  const confirmationDialog = useConfirmationDialog();
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

  const confirmBeforeClosing = () => {
    confirmationDialog.open({
      title: t('confirm.title'),
      description: t('confirm.description'),
      primaryButton: {
        label: t('confirm.cta'),
        onClick: onClose,
      },
      secondaryButton: {
        label: t('confirm.cancel'),
      },
    });
  };

  const handleSubmit = (formData: CreateProxyConfigRequest) => {
    mutation.mutate(formData, { onSuccess: onClose });
  };

  return (
    <FPDialog
      headerIcon={{
        component: isFirstStep ? IcoClose24 : IcoChevronLeftBig24,
        onClick: isFirstStep ? onClose : goBack,
      }}
      onClose={isFirstStep ? onClose : confirmBeforeClosing}
      open={open}
      size="compact"
      title={t('title')}
      linkButton={canSkip ? { label: allT('skip'), onClick: goForward } : undefined}
      primaryButton={{
        form: id,
        label: isLastStep ? allT('save') : allT('next'),
        loading: mutation.isLoading,
        type: 'submit',
      }}
      secondaryButton={{
        disabled: mutation.isLoading,
        label: allT('cancel'),
        onClick: isFirstStep ? onClose : confirmBeforeClosing,
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
