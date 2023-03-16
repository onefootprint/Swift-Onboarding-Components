import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronLeftBig24, IcoClose24 } from '@onefootprint/icons';
import { Dialog as FpDialog, useConfirmationDialog } from '@onefootprint/ui';
import React from 'react';

import getFormIdForState from '../../utils/get-form-id-for-state';
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Dialog = ({ open, onClose, onCreate }: DialogProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create-dialog',
  );
  const [state, send] = useOnboardingConfigMachine();
  const { type } = state.context;
  const isFirstStep = state.matches('type');
  const isFinalStep =
    (type === 'kyb' && state.matches('kybAccess')) ||
    (type === 'kyc' && state.matches('kycAccess'));
  const confirmationDialog = useConfirmationDialog();

  const confirmBeforeClosing = () => {
    confirmationDialog.open({
      title: allT('confirm.title'),
      description: allT('confirm.description'),
      primaryButton: {
        label: allT('confirm.cta'),
        onClick: onClose,
      },
      secondaryButton: {
        label: allT('confirm.cancel'),
      },
    });
  };

  const handleClose = () => {
    if (isFirstStep) {
      onClose();
    } else {
      confirmBeforeClosing();
    }
  };

  const handleBack = () => {
    send({
      type: 'prevClicked',
    });
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
        form: getFormIdForState(state.value),
        label: isFinalStep ? allT('save') : allT('next'),
        type: 'submit',
        // TODO: loading state & aria label
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
};

export default Dialog;
