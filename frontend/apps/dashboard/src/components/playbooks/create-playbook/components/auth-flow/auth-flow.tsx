import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { Stepper } from '@onefootprint/ui';
import isEqual from 'lodash/isEqual';
import { useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import useCreatePlaybook from '../../hooks/use-create-playbook';
import { useDialogButtons } from '../../hooks/use-dialog-buttons';
import useUpdatePlaybook from '../../hooks/use-update-playbook';
import NameStep from '../name-step';
import StepperContainer from '../stepper-container';
import RequiredAuthMethodsStep from './components/required-auth-methods-step';
import ReviewChangesStep from './components/review-changes-step';
import useOptions from './hooks/use-options';
import createPayload from './utils/create-payload';
import { getInitialValues, reducer } from './utils/reducer';

type AuthFlowProps = {
  onDone: () => void;
  onBack: () => void;
  playbook?: OnboardingConfiguration;
};

const AuthFlow = ({ onBack, onDone, playbook }: AuthFlowProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.stepper' });
  const initialState = useMemo(() => getInitialValues(playbook), [playbook]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const createMutation = useCreatePlaybook();
  const updateMutation = useUpdatePlaybook();
  const dialogButtons = useDialogButtons();
  const options = useOptions(playbook);
  const isEditing = !!playbook;

  return (
    <>
      <StepperContainer>
        <Stepper
          aria-label={t('aria-label')}
          onChange={(option: { value: string }) => {
            if (option.value === 'kind') {
              onBack();
            } else {
              dispatch({ type: 'navigateStep', payload: option.value });

              // When we're editing and we go back to the first step, we should hide the back button
              if (isEditing) {
                if (option.value === 'name') {
                  dialogButtons.reset();
                } else {
                  dialogButtons.resetWithBackButton();
                }
              }
            }
          }}
          options={options}
          value={{ option: { label: t(state.step), value: state.step } }}
        />
      </StepperContainer>
      {state.step === 'name' && (
        <NameStep
          defaultValues={state.data.nameForm}
          meta={{ kind: 'auth' }}
          onBack={onBack}
          onSubmit={data => {
            dispatch({ type: 'updateNameData', payload: data });
            dispatch({ type: 'updateStep', payload: 'details' });

            // Back button is not displayed by default when we're in the edit mode
            // We should only show when we change for the first time
            if (isEditing) {
              dialogButtons.showBackButton();
            }
          }}
        />
      )}
      {state.step === 'details' && (
        <RequiredAuthMethodsStep
          defaultValues={state.data.requiredAuthMethodsForm}
          onBack={() => {
            if (isEditing) {
              dialogButtons.hideBackButton();
            }
            dispatch({ type: 'updateStep', payload: 'name' });
          }}
          onSubmit={data => {
            dispatch({ type: 'updateDetailsData', payload: data });

            const formData = {
              nameForm: state.data.nameForm,
              requiredAuthMethodsForm: data,
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
            dispatch({ type: 'updateStep', payload: 'details' });
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

export default AuthFlow;
