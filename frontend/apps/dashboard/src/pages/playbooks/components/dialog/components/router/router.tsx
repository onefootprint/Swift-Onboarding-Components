import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Stepper } from '@onefootprint/ui';
import { useMachine } from '@xstate/react';
import React from 'react';

import PlaybookMachine from '@/playbooks/utils/machine';
import {
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
  Kind,
} from '@/playbooks/utils/machine/types';

import AuthorizedScopes from './components/authorized-scopes';
import WhoToOnboard from './components/who-to-onboard';
import YourPlaybook from './components/your-playbook';
import getStep from './utils/get-step';

type RouterProps = {
  onClose: () => void;
};

const Router = ({ onClose }: RouterProps) => {
  const [state, send] = useMachine(PlaybookMachine);
  const { t } = useTranslation('pages.playbooks.dialog.router');
  const options = [
    { value: 'whoToOnboard', label: t('who-to-onboard') },
    { value: 'yourPlaybook', label: t('your-playbook') },
    { value: 'authorizedScopes', label: t('authorized-scopes') },
  ];
  const defaultPlaybookValues =
    state.context.kind === Kind.KYB
      ? defaultPlaybookValuesKYB
      : defaultPlaybookValuesKYC;

  const step = getStep({ value: state.value as string });
  const stepperValue = options[step];

  return (
    <Container>
      <StepperContainer>
        <Stepper
          options={options}
          onChange={option => {
            if (option.value === 'whoToOnboard') {
              send('whoToOnboardSelected');
            } else if (option.value === 'yourPlaybook') {
              send('yourPlaybookSelected');
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
            defaultKind={state.context.kind}
            onSubmit={({ kind }) => {
              send('whoToOnboardSubmitted', { payload: { kind } });
            }}
          />
        )}
        {state.matches('yourPlaybook') && state.context.kind && (
          <YourPlaybook
            defaultValues={state.context.playbook ?? defaultPlaybookValues}
            kind={state.context.kind}
            onSubmit={data => {
              send('playbookSubmitted', { payload: { playbook: data } });
            }}
            onBack={() => send('whoToOnboardSelected')}
          />
        )}
        {state.matches('authorizedScopes') && (
          <AuthorizedScopes
            kind={state.context.kind}
            playbook={state.context.playbook ?? defaultPlaybookValues}
            onBack={() => send('yourPlaybookSelected')}
          />
        )}
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
