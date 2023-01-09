import { useTranslation } from '@onefootprint/hooks';
import { IcoChevronLeftBig24, IcoClose24 } from '@onefootprint/icons';
import { Dialog, useConfirmationDialog, useToast } from '@onefootprint/ui';
import React from 'react';

import AccessForm, { AccessFormData } from './components/access-form';
import CollectForm, { CollectFormData } from './components/collect-form';
import NameForm from './components/name-form';
import type { NameFormData } from './create-onboarding-config.types';
import useCreateOnboardingConfig from './hooks/use-create-onboarding-config';
import useCreateState, { Actions } from './hooks/use-create-state';
import {
  getSelectedKycDataOptions,
  getSelectedKycDataOptionsList,
} from './utils/get-selected-kyc-data-options';

export type CreateOnboardingConfigProps = {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;
};

const CreateOnboardingConfig = ({
  open,
  onClose,
  onCreate,
}: CreateOnboardingConfigProps) => {
  const [state, dispatch] = useCreateState();
  const mutation = useCreateOnboardingConfig();
  const confirmationDialog = useConfirmationDialog();
  const toast = useToast();
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.create',
  );

  const handleBack = () => {
    dispatch({ type: Actions.back });
  };

  const close = () => {
    dispatch({ type: Actions.reset });
    onClose();
  };

  const confirmBeforeClosing = () => {
    confirmationDialog.open({
      title: allT('confirm.title'),
      description: allT('confirm.description'),
      primaryButton: {
        label: allT('confirm.cta'),
        onClick: close,
      },
      secondaryButton: {
        label: allT('confirm.cancel'),
      },
    });
  };

  const handleClose = () => {
    if (state.step === 0) {
      close();
    } else {
      confirmBeforeClosing();
    }
  };

  const handleSubmitName = (formData: NameFormData) => {
    dispatch({
      type: Actions.next,
      payload: {
        data: {
          name: formData.name,
        },
      },
    });
  };

  const handleSubmitCollect = (formData: CollectFormData) => {
    const { kycData, documents } = formData;
    dispatch({
      type: Actions.next,
      payload: {
        data: {
          kycData,
          documents,
        },
      },
    });
  };

  const handleSubmitAccess = (accessFormData: AccessFormData) => {
    mutation.mutate(
      {
        name: state.data.name,
        mustCollectData: getSelectedKycDataOptionsList(state.data.kycData),
        mustCollectIdentityDocument: !!state.data.documents.idDoc,
        canAccessData: getSelectedKycDataOptionsList(accessFormData.kycData),
        canAccessIdentityDocumentImages: accessFormData.documents.idDoc,
      },
      {
        onSuccess: () => {
          toast.show({
            title: t('feedback.success.title'),
            description: t('feedback.success.description'),
          });
          onCreate();
          close();
        },
      },
    );
  };

  return (
    <Dialog
      size="compact"
      title={t('title')}
      closeAriaLabel={state.step === 0 ? allT('close') : allT('back')}
      primaryButton={{
        form: state.formId,
        label: state.step === 2 ? allT('save') : allT('next'),
        loading: mutation.isLoading,
        loadingAriaLabel: t('cta.aria-label'),
        type: 'submit',
      }}
      secondaryButton={{
        disabled: mutation.isLoading,
        label: allT('cancel'),
        onClick: handleClose,
      }}
      onClose={state.step === 0 ? handleClose : handleBack}
      closeIconComponent={state.step === 0 ? IcoClose24 : IcoChevronLeftBig24}
      open={open}
    >
      {state.step === 0 && (
        <NameForm
          onSubmit={handleSubmitName}
          defaultValues={{
            name: state.data.name,
          }}
        />
      )}
      {state.step === 1 && (
        <CollectForm
          onSubmit={handleSubmitCollect}
          defaultValues={{
            kycData: state.data.kycData,
            documents: state.data.documents,
          }}
        />
      )}
      {state.step === 2 && (
        <AccessForm
          onSubmit={handleSubmitAccess}
          fields={{
            kycData: getSelectedKycDataOptions(state.data.kycData),
            documents: {
              idDoc: !!state.data.documents.idDoc,
              selfie: !!state.data.documents.selfie,
            },
          }}
          defaultValues={{
            kycData: Object.fromEntries(
              getSelectedKycDataOptions(state.data.kycData),
            ),
            documents: {
              idDoc: !!state.data.documents.idDoc,
              selfie: !!state.data.documents.selfie,
            },
          }}
        />
      )}
    </Dialog>
  );
};

export default CreateOnboardingConfig;
