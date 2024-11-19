import { OnboardingConfigKind } from '@onefootprint/types';
import { Box, Dialog, media } from '@onefootprint/ui';
import { Suspense, lazy, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import StepKind from './components/kind-step';
import { DialogButtonsProvider, useDialogButtons } from './hooks/use-dialog-buttons';

const AuthFlow = lazy(() => import('./components/auth-flow'));
const DocumentFlow = lazy(() => import('./components/document-flow'));
const KycFlow = lazy(() => import('./components/kyc-flow'));
const KybFlow = lazy(() => import('./components/kyb-flow'));

type Step = 'select-kind' | OnboardingConfigKind;

type CreatePlaybookProps = {
  open: boolean;
  onClose: () => void;
  onDone: () => void;
};

const CreatePlaybook = ({ open, onDone, onClose }: CreatePlaybookProps) => {
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
          {step === 'auth' && <AuthFlow onDone={onDone} onBack={handleBack} />}
          {step === 'document' && <DocumentFlow onDone={onDone} onBack={handleBack} />}
          {step === 'kyc' && <KycFlow onDone={onDone} onBack={handleBack} />}
          {step === 'kyb' && <KybFlow onDone={onDone} onBack={handleBack} />}
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

export default ({ open, onDone, onClose }: CreatePlaybookProps) => {
  return (
    <DialogButtonsProvider>
      <CreatePlaybook open={open} onClose={onClose} onDone={onDone} />
    </DialogButtonsProvider>
  );
};
