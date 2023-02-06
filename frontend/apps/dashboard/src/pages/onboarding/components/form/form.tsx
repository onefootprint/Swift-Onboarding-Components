import { motion } from 'framer-motion';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import ProgressBar from './components/progress-bar';
import CompanyData from './components/steps/company-data';
import Invite from './components/steps/invite';
import UserData from './components/steps/user-data';
import Welcome from './components/steps/welcome';

export type FormProps = {
  onComplete: () => void;
};

const steps = [
  { id: 'welcome-form', Step: Welcome },
  { id: 'user-data-form', Step: UserData },
  { id: 'company-data-form', Step: CompanyData },
  { id: 'invite-form', Step: Invite },
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
    <Container
      layout
      transition={{
        layout: { duration: 0.1, ease: 'easeOut' },
      }}
    >
      <Step id={id} onComplete={handleComplete} />
      <Controls>
        <ProgressBar max={stepsCount} onPrev={handlePrev} value={step} />
        <ButtonsContainer id="onboarding-cta-portal" />
      </Controls>
    </Container>
  );
};

const Container = styled(motion.div)`
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

const Controls = styled.footer`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[5]} ${theme.spacing[7]};
  `}
`;

const ButtonsContainer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[7]};
  `}
`;

export default Form;
