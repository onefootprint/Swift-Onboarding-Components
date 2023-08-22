import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Stepper, useToast } from '@onefootprint/ui';
import { useMachine } from '@xstate/react';
import React from 'react';

import PlaybookMachine from '@/playbooks/utils/machine';
import {
  AuthorizedScopesFormData,
  defaultNameValue,
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
  Kind,
} from '@/playbooks/utils/machine/types';

import AuthorizedScopes from './components/authorized-scopes';
import NameYourPlaybook from './components/name-your-playbook';
import WhoToOnboard from './components/who-to-onboard';
import YourPlaybook from './components/your-playbook';
import getStep from './utils/get-step';
import processPlaybook from './utils/process-playbook';
import useCreatePlaybook from './utils/use-create-playbook';

type RouterProps = {
  onClose: () => void;
};
type HandleCreateProps = {
  authorizedScopes: AuthorizedScopesFormData;
};

const Router = ({ onClose }: RouterProps) => {
  const [state, send] = useMachine(PlaybookMachine);
  const { t } = useTranslation('pages.playbooks.dialog.router');
  const toast = useToast();
  const showRequestError = useRequestErrorToast();
  const mutation = useCreatePlaybook();

  const options = [
    { value: 'nameYourPlaybook', label: t('name-your-playbook') },
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

  // we can't break this out into a separate util b/c of hook dependencies
  const createPlaybook = ({ authorizedScopes }: HandleCreateProps) => {
    const { kind, playbook, name } = state.context;
    if (!kind || !playbook || !authorizedScopes || !name) {
      return;
    }
    const { mustCollectData, canAccessData, optionalData } = processPlaybook({
      kind,
      playbook,
      authorizedScopes,
    });
    mutation.mutate(
      {
        name,
        mustCollectData,
        canAccessData,
        optionalData,
      },
      {
        onSuccess: () => {
          toast.show({
            title: t('feedback.success.title'),
            description: t('feedback.success.description'),
          });
          onClose();
        },
        onError: (error: unknown) => {
          showRequestError(error);
        },
      },
    );
  };

  return (
    <Container>
      <StepperContainer>
        <Stepper
          options={options}
          onChange={option => {
            if (option.value === 'nameYourPlaybook') {
              send('nameYourPlaybookSelected');
            } else if (option.value === 'whoToOnboard') {
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
        {state.matches('nameYourPlaybook') && (
          <NameYourPlaybook
            defaultValues={{ name: state.context.name ?? defaultNameValue }}
            onBack={onClose}
            onSubmit={({ name }) => {
              send('nameYourPlaybookSubmitted', { payload: { name } });
            }}
          />
        )}
        {state.matches('whoToOnboard') && (
          <WhoToOnboard
            onBack={() => send('nameYourPlaybookSelected')}
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
            onSubmit={data => {
              // avoid state machine call — we don't store authorized scopes in context
              createPlaybook({
                authorizedScopes: data,
              });
            }}
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
