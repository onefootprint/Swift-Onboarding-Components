import type { StepperOption } from '@onefootprint/ui';
import { Stepper, media } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import CompanyData from './components/steps/company-data';
import Invite from './components/steps/invite';
import UserData, { type UserFormData } from './components/steps/user-data';
import Welcome from './components/steps/welcome';

type Company = {
  companyName: string;
  companySize: string;
  companyWebsite: string;
};
export type FormData = Partial<UserFormData> & Partial<Company>;
export type FormProps = {
  onComplete: (data: FormData) => void;
};

const Form = ({ onComplete }: FormProps) => {
  const { t } = useTranslation('onboarding');
  const options = [
    { value: 'welcome', label: t('welcome.nav') },
    { value: 'user', label: t('user-data.nav') },
    { value: 'company', label: t('company-data.nav') },
    { value: 'invite', label: t('invite.nav') },
  ];
  const [userFormData, setUserFormData] = useState<UserFormData>();
  const [companyFormData, setCompanyFormData] = useState<Company>();
  const [stepIndex, setStepIndex] = useState(0);
  const step = options[stepIndex];
  const maxStep = options.length - 1;

  const handleChange = (newOption: StepperOption) => {
    const newStepIndex = options.findIndex(option => option.value === newOption.value);
    setStepIndex(newStepIndex);
  };

  const handleComplete = () => {
    if (stepIndex === maxStep) {
      onComplete({ ...userFormData, ...companyFormData });
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
        {step.value === 'user' && (
          <UserData
            onComplete={data => {
              setUserFormData(data);
              handleComplete();
            }}
            onBack={handleBack}
          />
        )}
        {step.value === 'company' && (
          <CompanyData
            onComplete={data => {
              setCompanyFormData({
                companyName: data.name,
                companySize: data.size?.value || '',
                companyWebsite: data.website,
              });
              handleComplete();
            }}
            onBack={handleBack}
          />
        )}
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
