import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { Stepper } from '@onefootprint/ui';
import isEqual from 'lodash/isEqual';
import { useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';

import BoStep from './components/bo-step';
import BusinessStep from './components/business-step';
import ReviewChangesStep from './components/review-changes-step';
import VerificationChecks from './components/verification-checks-step';
import useOptions from './hooks/use-options';
import createPayload from './utils/create-payload';
import getStepperValue from './utils/get-stepper-value';
import { getInitialValues, reducer } from './utils/reducer';

import useCreatePlaybook from '../../hooks/use-create-playbook';
import { useDialogButtons } from '../../hooks/use-dialog-buttons';
import useUpdatePlaybook from '../../hooks/use-update-playbook';
import NameStep from '../name-step';
import RequiredAuthMethodsStep from '../required-auth-methods-step';
import StepperContainer from '../stepper-container';

type KybFlowProps = {
  onDone: () => void;
  onBack: () => void;
  playbook?: OnboardingConfiguration;
};

const KybFlow = ({ onBack, onDone, playbook }: KybFlowProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.stepper' });
  const initialState = useMemo(() => getInitialValues(playbook), [playbook]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const createMutation = useCreatePlaybook();
  const updateMutation = useUpdatePlaybook();
  const dialogButtons = useDialogButtons();
  const isEditing = !!playbook;
  const options = useOptions(playbook);

  return (
    <>
      <StepperContainer>
        <Stepper
          aria-label={t('aria-label')}
          onChange={option => {
            if (option.value === 'kind') {
              onBack();
            }
            if (option.value === 'details') {
              dispatch({ type: 'navigateStep', payload: 'business' });
            } else {
              dispatch({ type: 'navigateStep', payload: option.value });
            }

            if (isEditing) {
              if (option.value === 'name') {
                dialogButtons.reset();
              } else {
                dialogButtons.resetWithBackButton();
              }
            }
          }}
          options={options}
          value={getStepperValue(options, state.step)}
        />
      </StepperContainer>
      {state.step === 'name' && (
        <NameStep
          defaultValues={state.data.nameForm}
          meta={{ kind: 'kyb' }}
          onBack={onBack}
          onSubmit={data => {
            dispatch({ type: 'updateNameData', payload: data });
            dispatch({ type: 'updateStep', payload: 'business' });

            if (isEditing) {
              dialogButtons.showBackButton();
            }
          }}
        />
      )}
      {state.step === 'business' && (
        <BusinessStep
          defaultValues={state.data.businessForm}
          onBack={() => {
            if (isEditing) {
              dispatch({ type: 'updateStep', payload: 'name' });
              dialogButtons.hideBackButton();
            } else {
              dispatch({ type: 'updateStep', payload: 'name' });
            }
          }}
          onSubmit={data => {
            dispatch({ type: 'updateBusinessData', payload: data });
            dispatch({ type: 'updateStep', payload: 'bo' });
          }}
        />
      )}
      {state.step === 'bo' && (
        <BoStep
          defaultValues={state.data.boForm}
          onBack={() => {
            dispatch({ type: 'updateStep', payload: 'business' });
          }}
          onSubmit={data => {
            dispatch({ type: 'updateBOData', payload: data });
            dispatch({ type: 'updateStep', payload: 'requiredAuthMethods' });
          }}
        />
      )}
      {state.step === 'requiredAuthMethods' && (
        <RequiredAuthMethodsStep
          defaultValues={state.data.requiredAuthMethodsForm}
          onBack={() => {
            dispatch({ type: 'updateStep', payload: 'bo' });
          }}
          onSubmit={data => {
            dispatch({ type: 'updateRequiredAuthMethodsData', payload: data });
            dispatch({ type: 'updateStep', payload: 'verificationChecks' });
          }}
        />
      )}
      {state.step === 'verificationChecks' && (
        <VerificationChecks
          defaultValues={state.data.verificationChecksForm}
          meta={{
            collectsBO: state.data.boForm.data.collect,
            collectsBusinessAddress: state.data.businessForm.data.address,
          }}
          onBack={() => {
            dispatch({ type: 'updateStep', payload: 'requiredAuthMethods' });
          }}
          onSubmit={data => {
            dispatch({ type: 'updateVerificationChecksData', payload: data });

            const formData = {
              ...state.data,
              verificationChecksForm: data,
            };
            if (isEditing) {
              dispatch({ type: 'updateStep', payload: 'reviewChanges' });
              if (isEqual(initialState.data, formData)) {
                dialogButtons.setPrimaryButton({ label: 'Save changes', disabled: true });
              }
            } else {
              const payload = createPayload(formData);
              createMutation.mutate(payload, { onSuccess: onDone });
            }
          }}
        />
      )}
      {state.step === 'reviewChanges' && !!playbook && (
        <ReviewChangesStep
          meta={{
            formData: state.data,
            playbook: playbook,
            hasChanges: !isEqual(initialState.data, state.data),
          }}
          onBack={() => {
            dispatch({ type: 'updateStep', payload: 'verificationChecks' });
            dialogButtons.resetWithBackButton();
          }}
          onSubmit={() => {
            updateMutation.mutate(
              {
                body: {
                  expectedLatestObcId: playbook.id,
                  newOnboardingConfig: createPayload(state.data),
                },
                path: {
                  id: playbook.playbookId,
                },
              },
              {
                onSuccess: onDone,
              },
            );
          }}
        />
      )}
    </>
  );
};

export default KybFlow;
