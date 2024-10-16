import { OnboardingConfigKind } from '@onefootprint/types';
import { Box, Dialog, media } from '@onefootprint/ui';
import { Suspense, lazy, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import StepKind from './components/step-kind';
import { DialogButtonsProvider, useDialogButtons } from './hooks/use-dialog-buttons';

const FlowAuth = lazy(() => import('./components/flow-auth'));
const FlowDocument = lazy(() => import('./components/flow-document'));
const FlowKyc = lazy(() => import('./components/flow-kyc'));
const FlowKyb = lazy(() => import('./components/flow-kyb'));

type Step = 'select-kind' | OnboardingConfigKind;

type CreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
};

const CreateDialog = ({ open, onDone, onClose }: CreateDialogProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create' });
  const { primaryButton, secondaryButton, reset } = useDialogButtons();

  const handleClose = () => {
    onClose();
    reset();
  };

  const handleDone = () => {
    handleClose();
    onDone();
  };

  return (
    <Dialog
      title={t('title')}
      size="full-screen"
      open={open}
      onClose={handleClose}
      primaryButton={primaryButton}
      secondaryButton={secondaryButton}
    >
      <Form onDone={handleDone} />
    </Dialog>
  );
};

const Form = ({ onDone }: { onDone: () => void }) => {
  const [step, setStep] = useState<Step>('select-kind');
  const [kind, setKind] = useState<OnboardingConfigKind>(OnboardingConfigKind.kyc);
  const { showBackButton, hideBackButton } = useDialogButtons();

  const handleBack = () => {
    setStep('select-kind');
    hideBackButton();
  };

  const handleSubmitStep = ({ kind: newKind }: { kind: OnboardingConfigKind }) => {
    setKind(newKind);
    setStep(newKind);
    showBackButton();
  };

  return (
    <Box position="relative">
      <Content>
        {step === 'select-kind' && <StepKind defaultValues={{ kind }} onSubmit={handleSubmitStep} />}
        <Suspense fallback={null}>
          {step === 'auth' && <FlowAuth onDone={onDone} onBack={handleBack} />}
          {step === 'document' && <FlowDocument onDone={onDone} onBack={handleBack} />}
          {step === 'kyc' && <FlowKyc onDone={onDone} onBack={handleBack} />}
          {step === 'kyb' && <FlowKyb onDone={onDone} onBack={handleBack} />}
        </Suspense>
      </Content>
    </Box>
  );
};

const Content = styled.div`
  max-width: 520px;
  margin: auto;
 
  ${media.greaterThan('md')`
    max-width: 580px;
  `}
`;

export default ({ open, onDone, onClose }: CreateDialogProps) => {
  return (
    <DialogButtonsProvider>
      <CreateDialog open={open} onClose={onClose} onDone={onDone} />
    </DialogButtonsProvider>
  );
};
