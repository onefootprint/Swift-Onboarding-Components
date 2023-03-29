import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { IcoChevronLeftBig24, IcoClose24 } from '@onefootprint/icons';
import {
  Dialog as FpDialog,
  useConfirmationDialog,
  useToast,
} from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import useCreateOnboardingConfig from '../../../../hooks/use-create-onboarding-config';
import KybAccess from '../../../../pages/kyb-access';
import KybBoCollect from '../../../../pages/kyb-bo-collect';
import KybCollect from '../../../../pages/kyb-collect';
import KycAccess from '../../../../pages/kyc-access';
import KycCollect from '../../../../pages/kyc-collect';
import Name from '../../../../pages/name';
import Type from '../../../../pages/type/type';
import getFormIdForState from '../../../../utils/get-form-id-for-state';
import getOnboardingConfigFromContext from '../../../../utils/get-onboarding-config-from-context';
import { useOnboardingConfigMachine } from '../../../machine-provider';

type DialogContentProps = {
  hideKyb?: boolean;
  onClose: () => void;
  onCreate: () => void;
};

// We should never need this fallback name but it's here for typecheck safety
const DEFAULT_ONBOARDING_CONFIG_NAME = 'Unnamed Onboarding Config';

const DialogContent = ({ hideKyb, onClose, onCreate }: DialogContentProps) => {
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create',
  );
  const mutation = useCreateOnboardingConfig();
  const [state, send] = useOnboardingConfigMachine();
  const { name, type } = state.context;
  const isFirstStep = hideKyb ? state.matches('name') : state.matches('type');
  const isFinalStep =
    (type === 'kyb' && state.matches('kybAccess')) ||
    (type === 'kyc' && state.matches('kycAccess'));
  const isComplete = state.matches('complete');
  const confirmationDialog = useConfirmationDialog();
  const toast = useToast();
  const showRequestError = useRequestErrorToast();

  useEffectOnce(() => {
    if (hideKyb) {
      send({
        type: 'typeSubmitted',
        payload: {
          type: 'kyc',
        },
      });
    }
  });

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

  const handleCreate = () => {
    const { mustCollectData, canAccessData } = getOnboardingConfigFromContext(
      state.context,
    );

    mutation.mutate(
      {
        name: name ?? DEFAULT_ONBOARDING_CONFIG_NAME,
        mustCollectData,
        canAccessData,
      },
      {
        onSuccess: () => {
          toast.show({
            title: t('feedback.success.title'),
            description: t('feedback.success.description'),
          });
          onCreate();
          onClose();
        },
        onError: (error: unknown) => {
          showRequestError(error);
        },
      },
    );
  };

  useEffect(() => {
    if (state.done) {
      handleCreate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.done]);

  return (
    <FpDialog
      size="compact"
      testID="onboarding-configs-create-dialog"
      title={t('title')}
      closeAriaLabel={isFirstStep ? allT('close') : allT('back')}
      closeIconComponent={isFirstStep ? IcoClose24 : IcoChevronLeftBig24}
      onClose={isFirstStep || isComplete ? onClose : handleBack}
      open
      primaryButton={{
        form: getFormIdForState(state.value),
        label: isFinalStep ? allT('save') : allT('next'),
        loading: mutation.isLoading,
        loadingAriaLabel: t('cta.aria-label'),
        type: 'submit',
      }}
      secondaryButton={{
        disabled: mutation.isLoading,
        label: allT('cancel'),
        onClick: handleClose,
      }}
    >
      {state.matches('type') && <Type />}
      {state.matches('name') && <Name />}
      {state.matches('kycCollect') && <KycCollect />}
      {state.matches('kycAccess') && <KycAccess />}
      {state.matches('kybCollect') && <KybCollect />}
      {state.matches('kybBoCollect') && <KybBoCollect />}
      {state.matches('kybAccess') && <KybAccess />}
      {isComplete && type === 'kyc' && <KycAccess />}
      {isComplete && type === 'kyb' && <KybAccess />}
    </FpDialog>
  );
};

export default DialogContent;
