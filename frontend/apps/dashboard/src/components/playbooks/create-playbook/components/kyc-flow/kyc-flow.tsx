import { getOrgOptions } from '@onefootprint/axios/dashboard';
import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import { Stepper } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import isEqual from 'lodash/isEqual';
import { useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import useCreatePlaybook from '../../hooks/use-create-playbook';
import { useDialogButtons } from '../../hooks/use-dialog-buttons';
import NameStep from '../name-step';
import RequiredAuthMethodsStep from '../required-auth-methods-step';
import ResidencyStep from '../residency-step';
import StepperContainer from '../stepper-container';
import PersonStep from './components/details-step';
import ReviewChangesStep from './components/review-changes-step';
import TemplatesStep, { OnboardingTemplate } from './components/templates-step';
import VerificationChecksStep from './components/verification-checks-step';
import useOptions from './hooks/use-options';
import createPayload from './utils/create-payload';
import getStepperValue from './utils/get-stepper-value';
import { getInitialValues, reducer } from './utils/reducer';

type KycFlowProps = {
  onDone: () => void;
  onBack: () => void;
  playbook?: OnboardingConfiguration;
};

const KycFlow = ({ onBack, onDone, playbook }: KycFlowProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.stepper' });
  const initialState = useMemo(() => {
    return getInitialValues(playbook);
  }, [playbook]);
  const [state, dispatch] = useReducer(reducer, initialState);
  const createMutation = useCreatePlaybook();
  const orgQuery = useQuery(getOrgOptions());
  const options = useOptions(playbook);
  const { showBackButton, hideBackButton, setPrimaryButton, resetWithBackButton } = useDialogButtons();
  const isEditing = !!playbook;
  const isTemplateEditable =
    state.data.templateForm.template !== OnboardingTemplate.Alpaca &&
    state.data.templateForm.template !== OnboardingTemplate.Apex;

  return (
    <>
      <StepperContainer>
        <Stepper
          aria-label={t('aria-label')}
          onChange={option => {
            if (option.value === 'kind') {
              onBack();
            }

            // Playbook details has sub-options, meaning that we need to pick which sub-option we should start
            // in this case, we want to start always with "Residency"
            dispatch({ type: 'navigateStep', payload: option.value === 'details' ? 'residency' : option.value });

            // When we're editing and we go back to the first step, there's no reason
            // why we should display the back button, so we hide it
            if (isEditing && option.value === 'name') {
              hideBackButton();
            }
          }}
          options={options}
          value={getStepperValue(options, state.step)}
        />
      </StepperContainer>
      {state.step === 'name' && (
        <NameStep
          defaultValues={state.data.nameForm}
          meta={{ kind: 'kyc' }}
          onBack={() => {
            onBack();
          }}
          onSubmit={data => {
            dispatch({ type: 'updateNameData', payload: data });
            dispatch({ type: 'updateStep', payload: isEditing ? 'residency' : 'templates' });

            // Back button is not displayed by default when we're in the edit mode
            // We should only show when we change for the first time
            if (isEditing) {
              showBackButton();
            }
          }}
        />
      )}
      {state.step === 'templates' && (
        <TemplatesStep
          defaultValues={state.data.templateForm}
          onBack={() => {
            dispatch({ type: 'updateStep', payload: 'name' });
          }}
          onSubmit={data => {
            dispatch({ type: 'updateTemplateData', payload: data });
            dispatch({ type: 'updateStep', payload: 'residency' });
          }}
        />
      )}
      {state.step === 'residency' && (
        <ResidencyStep
          meta={{
            canEdit: isTemplateEditable,
          }}
          defaultValues={state.data.residencyForm}
          onBack={() => {
            if (isEditing) {
              dispatch({ type: 'updateStep', payload: 'name' });
              hideBackButton();
            } else {
              dispatch({ type: 'updateStep', payload: 'templates' });
            }
          }}
          onSubmit={data => {
            dispatch({ type: 'updateResidencyData', payload: data });
            dispatch({ type: 'updateStep', payload: 'kycData' });
          }}
        />
      )}
      {state.step === 'kycData' && (
        <PersonStep
          meta={{
            canEdit: state.data.residencyForm.residencyType === 'us' && isTemplateEditable,
            residencyForm: state.data.residencyForm,
            templateForm: state.data.templateForm,
          }}
          defaultValues={state.data.detailsForm}
          onBack={() => {
            dispatch({ type: 'updateStep', payload: 'residency' });
          }}
          onSubmit={data => {
            dispatch({ type: 'updateDetailsData', payload: data });
            dispatch({ type: 'updateStep', payload: 'requiredAuthMethods' });
          }}
        />
      )}
      {state.step === 'requiredAuthMethods' && (
        <RequiredAuthMethodsStep
          defaultValues={state.data.requiredAuthMethodsForm}
          onBack={() => {
            dispatch({ type: 'updateStep', payload: 'kycData' });
          }}
          onSubmit={data => {
            dispatch({ type: 'updateRequiredAuthMethodsData', payload: data });
            dispatch({ type: 'updateStep', payload: 'verificationChecks' });
          }}
        />
      )}
      {state.step === 'verificationChecks' && (
        <VerificationChecksStep
          defaultValues={state.data.verificationChecksForm}
          meta={{
            canEdit: isTemplateEditable,
            allowInternationalResident: state.data.residencyForm.residencyType !== 'us',
            collectsDocs: state.data.detailsForm.gov.global.length > 0,
            collectsPhone: state.data.detailsForm.person.phoneNumber,
            collectsSsn9:
              state.data.detailsForm.person.ssn.collect && state.data.detailsForm.person.ssn.kind === 'ssn9',
            isProdNeuroEnabled: orgQuery.data?.isProdNeuroEnabled || false,
            isProdSentilinkEnabled: orgQuery.data?.isProdSentilinkEnabled || false,
          }}
          onBack={() => {
            dispatch({ type: 'updateStep', payload: 'requiredAuthMethods' });
          }}
          onSubmit={data => {
            dispatch({ type: 'updateVerificationChecksData', payload: data });

            if (isEditing) {
              dispatch({ type: 'updateStep', payload: 'reviewChanges' });
              setPrimaryButton({ label: 'Save changes', disabled: true });
            } else {
              const payload = createPayload({
                ...state.data,
                verificationChecksForm: data,
              });
              createMutation.mutate(payload, { onSuccess: onDone });
            }
          }}
        />
      )}
      {state.step === 'reviewChanges' && (
        <ReviewChangesStep
          meta={{
            hasChanges: !isEqual(initialState.data, state.data),
          }}
          onBack={() => {
            dispatch({ type: 'updateStep', payload: 'verificationChecks' });
            resetWithBackButton();
          }}
        />
      )}
    </>
  );
};

export default KycFlow;
