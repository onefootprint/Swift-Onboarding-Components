import { useTranslation } from 'hooks';
import IcoChevronLeft24 from 'icons/ico/ico-chevron-left-24';
import IcoClose24 from 'icons/ico/ico-close-16';
import React from 'react';
import { Dialog, useConfirmationDialog } from 'ui';

import AccessForm from './components/access-form';
import CollectForm from './components/collect-form';
import NameForm from './components/name-form';
import type {
  DataKindForm,
  NameFormData,
} from './create-onboarding-config.types';
import useCreateOnboardingConfig from './hooks/use-create-onboarding-config';
import useCreateState, { Actions } from './hooks/use-create-state';
import getSelectedDataKinds from './utils/get-selected-data-kinds';
import transformDataKindFormToArray from './utils/transform-data-kind-form-to-array';

export type CreateOnboardingConfigProps = {
  open: boolean;
  onClose: () => void;
};

const CreateOnboardingConfig = ({
  open,
  onClose,
}: CreateOnboardingConfigProps) => {
  const [state, dispatch] = useCreateState();
  const mutation = useCreateOnboardingConfig();
  const confirmationDialog = useConfirmationDialog();
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
      payload: { data: { name: formData.name } },
    });
  };

  const handleSubmitCollect = (formData: DataKindForm) => {
    dispatch({ type: Actions.next, payload: { data: { collect: formData } } });
  };

  const handleSubmitAccess = (accessFormData: DataKindForm) => {
    mutation.mutate(
      {
        name: state.data.name,
        mustCollectDataKinds: transformDataKindFormToArray(state.data.collect),
        canAccessDataKinds: transformDataKindFormToArray(accessFormData),
      },
      {
        onSuccess: close,
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
      closeIconComponent={state.step === 0 ? IcoClose24 : IcoChevronLeft24}
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
          defaultValues={state.data.collect}
        />
      )}
      {state.step === 2 && (
        <AccessForm
          onSubmit={handleSubmitAccess}
          fields={getSelectedDataKinds(state.data?.collect)}
          defaultValues={Object.fromEntries(
            getSelectedDataKinds(state.data?.collect),
          )}
        />
      )}
    </Dialog>
  );
};

export default CreateOnboardingConfig;
