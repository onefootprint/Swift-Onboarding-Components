import { OnboardingConfigKind } from '@onefootprint/types';
import { Stepper } from '@onefootprint/ui';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';

import useCreatePlaybook from '../../hooks/use-create-playbook';
import NameStep from '../step-name';
import StepperContainer from '../stepper-container';
import DocumentDetailsStep from './components/step-document-details';
import createPayload from './utils/create-payload';
import { type Step, initialState, reducer } from './utils/reducer';

type DocumentFlowProps = {
  onDone: () => void;
  onBack: () => void;
};

const DocumentFlow = ({ onBack, onDone }: DocumentFlowProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.stepper' });
  const [state, dispatch] = useReducer(reducer, initialState);
  const createMutation = useCreatePlaybook();

  const handleStepChange = (option: { value: string }) => {
    if (option.value === 'kind') {
      onBack();
    } else {
      dispatch({ type: 'navigateStep', payload: option.value as Step });
    }
  };

  return (
    <>
      <StepperContainer>
        <Stepper
          aria-label={t('aria-label')}
          onChange={handleStepChange}
          options={[
            { label: t('name'), value: 'name' },
            { label: t('details'), value: 'details' },
          ]}
          value={{ option: { label: t(state.step), value: state.step } }}
        />
      </StepperContainer>
      {state.step === 'name' && (
        <NameStep
          defaultValues={state.data.nameForm}
          meta={{ kind: OnboardingConfigKind.document }}
          onBack={onBack}
          onSubmit={data => {
            dispatch({ type: 'updateNameData', payload: data });
            dispatch({ type: 'updateStep', payload: 'details' });
          }}
        />
      )}
      {state.step === 'details' && (
        <DocumentDetailsStep
          defaultValues={state.data.detailsForm}
          onBack={() => dispatch({ type: 'updateStep', payload: 'name' })}
          onSubmit={data => {
            dispatch({ type: 'updateDetailsData', payload: data });
            const payload = createPayload({ ...state.data.nameForm, ...data });
            createMutation.mutate(payload, { onSuccess: onDone });
          }}
        />
      )}
    </>
  );
};

export default DocumentFlow;
