import { primitives } from '@onefootprint/design-tokens';
import styled, { css } from '@onefootprint/styled';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import React, { useState } from 'react';

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
  { id: 'onboarding-company-data-content', Step: CompanyData },
  { id: 'invite-form', Step: Invite },
];

const Form = ({ onComplete }: FormProps) => {
  const [step, setStep] = useState(0);
  const stepsCount = steps.length;
  const maxStep = stepsCount - 1;
  const { Step, id } = steps[step];
  const isDarkTheme = useTheme().theme === 'dark';

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
      data-step={id}
      layout
      transition={{
        layout: { duration: 0.1, ease: 'linear' },
      }}
      isDarkTheme={isDarkTheme}
    >
      <motion.span key={id} initial={{ scale: 1 }} animate={{ scale: 1 }}>
        <Step id={id} onComplete={handleComplete} />
      </motion.span>
      <Controls>
        <ProgressBar max={stepsCount} onPrev={handlePrev} value={step} />
        <ButtonsContainer id="onboarding-cta-portal" />
      </Controls>
    </Container>
  );
};

const Container = styled(motion.div)<{ isDarkTheme: boolean }>`
  ${({ theme, isDarkTheme }) => css`
    background: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[1]};
    margin-bottom: ${theme.spacing[6]};
    overflow: hidden;
    position: relative;
    width: 500px;

    &[data-step='welcome-form'] {
      background-blend-mode: overlay;
      background: url('/onboarding/noise.svg'),
        ${isDarkTheme
          ? `
            linear-gradient(
              180deg,
              ${primitives.Gray825} 0%,
              transparent 100%
            );
            `
          : `
            linear-gradient(
                180deg,
                ${primitives.Purple100} 0%,
                transparent 100%
              );
          `};
    }
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
