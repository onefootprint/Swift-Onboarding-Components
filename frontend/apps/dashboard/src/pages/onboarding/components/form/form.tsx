import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import FormControls from './components/form-controls';
import CompanyDataStep from './components/steps/company-data-step';
import InviteStep from './components/steps/invite-step';
import UserDataStep from './components/steps/user-data-step';
import WelcomeStep from './components/steps/welcome-step';

export type FormProps = {
  onComplete: () => void;
};

const steps = [
  { id: 'welcome-form', Step: WelcomeStep },
  { id: 'user-data-form', Step: UserDataStep },
  { id: 'company-data-form', Step: CompanyDataStep },
  { id: 'invite-form', Step: InviteStep },
];

const Form = ({ onComplete }: FormProps) => {
  const [step, setStep] = useState(0);
  const stepsCount = steps.length;
  const maxStep = stepsCount - 1;
  const { Step, id } = steps[step];

  const handleComplete = () => {
    if (step === maxStep) {
      onComplete();
    } else {
      setStep(prevStep => prevStep + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(prevStep => prevStep - 1);
    }
  };

  return (
    <Container>
      <Step id={id} onComplete={handleComplete} />
      <FormControls id={id} max={stepsCount} onPrev={handlePrev} value={step} />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[1]};
    margin-bottom: ${theme.spacing[6]};
    width: 500px;
  `}
`;

export default Form;
