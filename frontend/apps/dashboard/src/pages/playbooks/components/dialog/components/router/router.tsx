import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Stepper } from '@onefootprint/ui';
import { useMachine } from '@xstate/react';
import React from 'react';

import WhoToOnboard from './components/who-to-onboard';
import YourPlaybook from './components/your-playbook';
import PlaybookMachine from './utils/machine/machine';
import { Kind } from './utils/machine/types';

type RouterProps = {
  onClose: () => void;
};

const Router = ({ onClose }: RouterProps) => {
  const [state, send] = useMachine(PlaybookMachine);
  const { t } = useTranslation('pages.playbooks.dialog.router');
  const options = [
    { value: 'whoToOnboard', label: t('who-to-onboard') },
    { value: 'yourPlaybook', label: t('your-playbook') },
  ];

  const stepperValue = state.matches('whoToOnboard') ? options[0] : options[1];

  return (
    <Container>
      <StepperContainer>
        <Stepper
          options={options}
          onChange={option => {
            if (option.value === 'whoToOnboard') {
              send('whoToOnboardSelected');
            }
          }}
          value={stepperValue}
          aria-label={t('stepper.ariaLabel')}
        />
      </StepperContainer>
      <Content>
        {state.matches('whoToOnboard') && (
          <WhoToOnboard
            onBack={onClose}
            defaultKind={state.context?.kind ?? Kind.KYC}
            onSubmit={({ kind }) => {
              send('whoToOnboardSubmitted', { payload: { kind } });
            }}
          />
        )}
        {state.matches('yourPlaybook') && <YourPlaybook />}
      </Content>
    </Container>
  );
};

const StepperContainer = styled.div`
  ${({ theme }) => css`
    white-space: nowrap;
    margin-left: ${theme.spacing[10]};
  `}
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  grid-area: content;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-areas: 'stepper content .';
`;

export default Router;
