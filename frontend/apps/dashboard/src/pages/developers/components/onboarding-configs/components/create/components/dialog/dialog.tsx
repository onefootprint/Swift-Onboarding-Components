import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronLeftBig24, IcoClose24 } from '@onefootprint/icons';
import { Dialog as FpDialog } from '@onefootprint/ui';
import React from 'react';

import KybAccessForm from '../kyb-access-form';
import KybCollectForm from '../kyb-collect-form';
import KycAccessForm from '../kyc-access-form';
import KycCollectForm from '../kyc-collect-form';
import { useOnboardingConfigMachine } from '../machine-provider';
import NameForm from '../name-form';
import TypeForm from '../type-form';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
};

const Dialog = ({ open, onClose, onCreate }: DialogProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create',
  );
  const [state] = useOnboardingConfigMachine();
  const isFirstStep = state.matches('type');

  const handleClose = () => {
    // TODO:
    onClose();
    onCreate();
  };

  const handleBack = () => {
    // TODO:
  };

  return (
    <FpDialog
      size="compact"
      title={t('title')}
      closeAriaLabel={isFirstStep ? allT('close') : allT('back')}
      closeIconComponent={isFirstStep ? IcoClose24 : IcoChevronLeftBig24}
      onClose={isFirstStep ? onClose : handleBack}
      open={open}
      primaryButton={{
        label: 'todo',
      }}
      secondaryButton={{
        label: allT('cancel'),
        onClick: handleClose,
      }}
    >
      {state.matches('type') && <TypeForm />}
      {state.matches('name') && <NameForm />}
      {state.matches('kycCollect') && <KycCollectForm />}
      {state.matches('kycAccess') && <KycAccessForm />}
      {state.matches('kybCollect') && <KybCollectForm />}
      {state.matches('kybAccess') && <KybAccessForm />}
    </FpDialog>
  );

  return null;
};

export default Dialog;
