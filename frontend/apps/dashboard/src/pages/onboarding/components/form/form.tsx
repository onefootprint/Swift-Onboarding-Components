import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import FormControls from './components/form-controls';
import CompanyData from './components/steps/company-data';
import Invite from './components/steps/invite';
import UserData from './components/steps/user-data';
import Welcome from './components/steps/welcome';

export type FormProps = {
  onComplete: () => void;
  onSkip?: () => void;
};

const steps = [
  { id: 'welcome-form', Step: Welcome },
  { id: 'user-data-form', Step: UserData },
  { id: 'company-data-form', Step: CompanyData },
  { id: 'invite-form', Step: Invite },
];

const Form = ({ onComplete, onSkip }: FormProps) => {
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
      <FormControls
        id={id}
        max={stepsCount}
        onPrev={handlePrev}
        onSkip={onSkip}
        value={step}
      />
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
    overflow: hidden;
    position: relative;
    width: 500px;
  `}
`;

export default Form;
