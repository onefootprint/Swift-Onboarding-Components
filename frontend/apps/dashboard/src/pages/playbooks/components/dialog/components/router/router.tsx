import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Stepper, useToast } from '@onefootprint/ui';
import { useMachine } from '@xstate/react';
import React from 'react';

import PlaybookMachine from '@/playbooks/utils/machine';
import {
  AuthorizedScopesFormData,
  defaultNameFormData,
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
    { value: 'whoToOnboard', label: t('who-to-onboard') },
    { value: 'nameYourPlaybook', label: t('name-your-playbook') },
    { value: 'yourPlaybook', label: t('your-playbook') },
    { value: 'authorizedScopes', label: t('authorized-scopes') },
  ];
  const playbookDefaultValues =
    state.context.kind === Kind.KYB
      ? defaultPlaybookValuesKYB
      : defaultPlaybookValuesKYC;

  const playbookValuesToPrefill =
    state.context?.playbook?.kind === state.context.kind &&
    state.context.playbook
      ? state.context.playbook
      : playbookDefaultValues;

  const nameValueToPrefill =
    state.context?.nameForm?.kind === state.context.kind &&
    state.context.nameForm
      ? state.context.nameForm
      : defaultNameFormData;

  const step = getStep({ value: state.value as string });
  const stepperValue = options[step];

  // we can't break this out into a separate util b/c of hook dependencies
  const createPlaybook = ({ authorizedScopes }: HandleCreateProps) => {
    const { kind, playbook, nameForm } = state.context;
    if (!kind || !playbook || !authorizedScopes || !nameForm) {
      return;
    }
    const {
      mustCollectData,
      canAccessData,
      optionalData,
      isDocFirstFlow,
      isNoPhoneFlow,
      name,
    } = processPlaybook({
      kind,
      playbook,
      authorizedScopes,
      nameForm,
    });
    mutation.mutate(
      {
        name,
        mustCollectData,
        canAccessData,
        optionalData,
        isDocFirstFlow,
        isNoPhoneFlow,
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
          aria-label={t('stepper.aria-label')}
        />
      </StepperContainer>
      <Content>
        {state.matches('whoToOnboard') && (
          <WhoToOnboard
            defaultKind={state.context.kind}
            onSubmit={({ kind }) => {
              send('whoToOnboardSubmitted', { payload: { kind } });
            }}
          />
        )}
        {state.matches('nameYourPlaybook') && (
          <NameYourPlaybook
            kind={state.context.kind}
            defaultValues={nameValueToPrefill}
            onBack={() => send('whoToOnboardSelected')}
            onSubmit={data => {
              send('nameYourPlaybookSubmitted', {
                payload: { nameForm: data },
              });
            }}
          />
        )}
        {state.matches('yourPlaybook') && state.context.kind && (
          <YourPlaybook
            defaultValues={playbookValuesToPrefill}
            kind={state.context.kind}
            onSubmit={data => {
              send('playbookSubmitted', { payload: { playbook: data } });
            }}
            onBack={() => send('nameYourPlaybookSelected')}
          />
        )}
        {state.matches('authorizedScopes') && (
          <AuthorizedScopes
            kind={state.context.kind}
            playbook={state.context.playbook ?? playbookValuesToPrefill}
            onBack={() => send('yourPlaybookSelected')}
            onSubmit={data => {
              // avoid state machine call — we don't store authorized scopes in context
              createPlaybook({
                authorizedScopes: data,
              });
            }}
            submissionLoading={mutation.isLoading}
          />
        )}
      </Content>
    </Container>
  );
};

const StepperContainer = styled.div`
  ${({ theme }) => css`
    white-space: nowrap;
    margin-top: ${theme.spacing[5]};

    @media (max-width: 960px) {
      display: none;
    }
    @media (min-width: 960px) {
      margin-left: ${theme.spacing[10]};
      position: fixed;
    }
  `}
`;

const Content = styled.div`
  grid-area: content;
  @media (max-width: 960px) {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  @media (min-width: 960px) and (max-width: 1100px) {
    margin-left: 220px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  @media (min-width: 1100px) {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const Container = styled.div`
  @media (max-width: 959px) {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }
  @media (min-width: 960px) and (max-width: 1100px) {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
  }
  @media (min-width: 1100px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-areas: 'stepper content .';
  }
`;

export default Router;
