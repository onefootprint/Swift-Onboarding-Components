import type { StepperOption } from '@onefootprint/ui';
import { Stepper, media } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import CompanyData from './components/steps/company-data';
import Invite from './components/steps/invite';
import UserData from './components/steps/user-data';
import Welcome from './components/steps/welcome';

export type FormProps = {
  onComplete: () => void;
};

const Form = ({ onComplete }: FormProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.onboarding' });
  const options = [
    { value: 'welcome', label: t('welcome.nav') },
    { value: 'user', label: t('user-data.nav') },
    { value: 'company', label: t('company-data.nav') },
    { value: 'invite', label: t('invite.nav') },
  ];
  const [stepIndex, setStepIndex] = useState(0);
  const step = options[stepIndex];
  const maxStep = options.length - 1;

  const handleChange = (newOption: StepperOption) => {
    const newStepIndex = options.findIndex(option => option.value === newOption.value);
    setStepIndex(newStepIndex);
  };

  const handleComplete = () => {
    if (stepIndex === maxStep) {
      onComplete();
    } else {
      setStepIndex(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex(prevStep => prevStep - 1);
    }
  };

  return (
    <Container>
      <StepperContainer>
        <Stepper
          options={options}
          onChange={handleChange}
          value={{ option: step }}
          aria-label={t('stepper.aria-label')}
        />
      </StepperContainer>
      <Content>
        {step.value === 'welcome' && <Welcome onComplete={handleComplete} />}
        {step.value === 'user' && <UserData onComplete={handleComplete} onBack={handleBack} />}
        {step.value === 'company' && <CompanyData onComplete={handleComplete} onBack={handleBack} />}
        {step.value === 'invite' && <Invite onComplete={handleComplete} onBack={handleBack} />}
      </Content>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[9]};

    ${media.greaterThan('md')`
      display: grid;
      grid-template-areas: 'stepper content .';
      grid-template-columns: 1fr 440px 1fr;
      margin-top: ${theme.spacing[10]};
    `}
  `}
`;

const StepperContainer = styled.div`
  display: none;

  ${media.greaterThan('md')`
    display: block;
  `}
`;

const Content = styled.div``;

export default Form;
