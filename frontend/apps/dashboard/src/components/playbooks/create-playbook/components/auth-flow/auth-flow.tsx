import { Stepper } from '@onefootprint/ui';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import useCreatePlaybook from '../../hooks/use-create-playbook';
import NameStep from '../name-step';
import StepperContainer from '../stepper-container';
import AuthDetailsStep from './components/auth-details-step';
import createPayload from './utils/create-payload';
import { type Step, initialState, reducer } from './utils/reducer';

type AuthFlowProps = {
  onDone: () => void;
  onBack: () => void;
};

const AuthFlow = ({ onBack, onDone }: AuthFlowProps) => {
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
          meta={{ kind: 'auth' }}
          onBack={onBack}
          onSubmit={data => {
            dispatch({ type: 'updateNameData', payload: data });
            dispatch({ type: 'updateStep', payload: 'details' });
          }}
        />
      )}
      {state.step === 'details' && (
        <AuthDetailsStep
          defaultValues={state.data.authDetailsForm}
          onBack={() => dispatch({ type: 'updateStep', payload: 'name' })}
          onSubmit={data => {
            dispatch({ type: 'updateDetailsData', payload: data });
            const payload = createPayload({
              nameForm: state.data.nameForm,
              requiredAuthMethodsForm: data,
            });
            createMutation.mutate(payload, { onSuccess: onDone });
          }}
        />
      )}
    </>
  );
};

export default AuthFlow;
