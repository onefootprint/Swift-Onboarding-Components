import { getOrgOptions } from '@onefootprint/axios/dashboard';
import { CollectedKycDataOption, OnboardingConfigKind } from '@onefootprint/types';
import { Stepper } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import useCreatePlaybook from '../../hooks/use-create-playbook';
import NameStep from '../name-step';
import RequiredAuthMethodsStep from '../required-auth-methods-step';
import ResidencyStep from '../residency-step';
import StepperContainer from '../stepper-container';
import PersonStep from './components/details-step';
import TemplatesStep, { OnboardingTemplate } from './components/templates-step';
import VerificationChecksStep from './components/verification-checks-step';
import createPayload from './utils/create-payload';
import getStepperValue from './utils/get-stepper-value';
import { initialState, reducer } from './utils/reducer';

type KycFlowProps = {
  onDone: () => void;
  onBack: () => void;
};

const KycFlow = ({ onBack, onDone }: KycFlowProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.stepper' });
  const [state, dispatch] = useReducer(reducer, initialState);
  const createMutation = useCreatePlaybook();
  const orgQuery = useQuery(getOrgOptions());
  const options = [
    { label: t('name'), value: 'name' },
    { label: t('templates'), value: 'templates' },
    {
      label: t('details'),
      value: 'details',
      options: [
        {
          label: t('residency'),
          value: 'residency',
        },
        {
          label: t('personal'),
          value: 'kycData',
        },
        {
          label: t('otp'),
          value: 'requiredAuthMethods',
        },
      ],
    },
    { label: t('verification-checks'), value: 'verificationChecks' },
  ];
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
            if (option.value === 'details') {
              dispatch({ type: 'navigateStep', payload: 'residency' });
            } else {
              dispatch({ type: 'navigateStep', payload: option.value });
            }
          }}
          options={options}
          value={getStepperValue(options, state.step)}
        />
      </StepperContainer>
      {state.step === 'name' && (
        <NameStep
          defaultValues={state.data.nameForm}
          meta={{ kind: OnboardingConfigKind.kyc }}
          onBack={onBack}
          onSubmit={data => {
            dispatch({ type: 'updateNameData', payload: data });
            dispatch({ type: 'updateStep', payload: 'templates' });
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
            dispatch({ type: 'updateStep', payload: 'templates' });
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
              state.data.detailsForm.person.ssn.collect &&
              state.data.detailsForm.person.ssn.kind === CollectedKycDataOption.ssn9,
            isProdNeuroEnabled: orgQuery.data?.isProdNeuroEnabled || false,
            isProdSentilinkEnabled: orgQuery.data?.isProdSentilinkEnabled || false,
          }}
          onBack={() => {
            dispatch({ type: 'updateStep', payload: 'requiredAuthMethods' });
          }}
          onSubmit={data => {
            dispatch({ type: 'updateVerificationChecksData', payload: data });
            const payload = createPayload({
              ...state.data,
              verificationChecksForm: data,
            });
            createMutation.mutate(payload, { onSuccess: onDone });
          }}
        />
      )}
    </>
  );
};

export default KycFlow;
