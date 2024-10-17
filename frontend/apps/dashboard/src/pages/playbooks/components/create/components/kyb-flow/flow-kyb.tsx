import { OnboardingConfigKind } from '@onefootprint/types';
import { Stepper } from '@onefootprint/ui';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';

import BoStep from './components/bo-step';
import BusinessStep from './components/business-step';
import VerificationChecks from './components/verification-checks-step';
import createPayload from './utils/create-payload';
import getStepperValue from './utils/get-stepper-value';
import { initialState, reducer } from './utils/reducer';

import useCreatePlaybook from '../../hooks/use-create-playbook';
import NameStep from '../name-step';
import RequiredAuthMethodsStep from '../required-auth-methods-step';
import StepperContainer from '../stepper-container';

type FlowKyb = {
  onDone: () => void;
  onBack: () => void;
};

const FlowKyb = ({ onBack, onDone }: FlowKyb) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.stepper' });
  const [state, dispatch] = useReducer(reducer, initialState);
  const createMutation = useCreatePlaybook();
  const options = [
    { label: t('name'), value: 'name' },
    {
      label: t('details'),
      value: 'details',
      options: [
        {
          label: t('business'),
          value: 'business',
        },
        {
          label: t('bo'),
          value: 'bo',
        },
        {
          label: t('otp'),
          value: 'requiredAuthMethods',
        },
      ],
    },
    { label: t('verification-checks'), value: 'verificationChecks' },
  ];

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
            dispatch({ type: 'updateStep', payload: 'business' });
          }}
        />
      )}
      {state.step === 'business' && (
        <BusinessStep
          defaultValues={state.data.businessForm}
          onBack={() => {
            dispatch({ type: 'updateStep', payload: 'name' });
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

export default FlowKyb;
