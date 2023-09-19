import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import styled, { css } from '@onefootprint/styled';
import { Stepper, useToast } from '@onefootprint/ui';
import { useMachine } from '@xstate/react';
import React from 'react';

import playbookMachine from '@/playbooks/utils/machine';
import type { AuthorizedScopesFormData } from '@/playbooks/utils/machine/types';
import {
  defaultNameFormData,
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
  defaultResidencyFormData,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

import AuthorizedScopes from './components/authorized-scopes';
import NameYourPlaybook from './components/name-your-playbook';
import Residency from './components/residency';
import Summary from './components/summary';
import WhoToOnboard from './components/who-to-onboard';
import useOptions from './hooks/use-options';
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
  const [state, send] = useMachine(playbookMachine);
  const { kind } = state.context;
  const { t } = useTranslation('pages.playbooks.dialog.router');
  const toast = useToast();
  const showRequestError = useRequestErrorToast();
  const mutation = useCreatePlaybook();
  const allOptions = useOptions();
  const options = allOptions[kind];
  const step = getStep({ value: state.value as string });
  const stepperValue = options[step];

  const playbookDefaultValues =
    kind === PlaybookKind.Kyb
      ? defaultPlaybookValuesKYB
      : defaultPlaybookValuesKYC;

  const playbookValuesToPrefill =
    state.context?.playbook?.kind === kind && state.context.playbook
      ? state.context.playbook
      : playbookDefaultValues;

  const nameValueToPrefill =
    state.context?.nameForm?.kind === kind && state.context.nameForm
      ? state.context.nameForm
      : defaultNameFormData;

  const residencyValueToPrefill =
    kind === PlaybookKind.Kyc && state.context.residencyForm
      ? state.context.residencyForm
      : defaultResidencyFormData;

  const createPlaybook = ({ authorizedScopes }: HandleCreateProps) => {
    const { playbook, nameForm, residencyForm } = state.context;
    if (!playbook || !authorizedScopes || !nameForm) {
      return;
    }
    const {
      allowInternationalResidents,
      allowUsResidents,
      allowUsTerritories,
      canAccessData,
      internationalCountryRestrictions,
      isDocFirstFlow,
      isNoPhoneFlow,
      mustCollectData,
      name,
      optionalData,
    } = processPlaybook({
      authorizedScopes,
      kind,
      nameForm,
      playbook,
      residencyForm,
    });
    mutation.mutate(
      {
        allowInternationalResidents,
        allowUsResidents,
        allowUsTerritories,
        canAccessData,
        internationalCountryRestrictions,
        isDocFirstFlow,
        isNoPhoneFlow,
        mustCollectData,
        name,
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
          console.error('Failed to create playbook', getErrorMessage(error));
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
            } else if (option.value === 'summary') {
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
            onSubmit={payload => {
              send('whoToOnboardSubmitted', { payload });
            }}
          />
        )}
        {state.matches('residency') && (
          <Residency
            defaultValues={residencyValueToPrefill}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={formData => {
              send('residencySubmitted', {
                payload: { formData },
              });
            }}
          />
        )}
        {state.matches('nameYourPlaybook') && (
          <NameYourPlaybook
            kind={state.context.kind}
            defaultValues={nameValueToPrefill}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={formData => {
              send('nameYourPlaybookSubmitted', {
                payload: { formData },
              });
            }}
          />
        )}
        {state.matches('summary') && (
          <Summary
            defaultValues={playbookValuesToPrefill}
            meta={{
              kind: state.context.kind,
              residency: state.context.residencyForm,
            }}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={formData => {
              send('playbookSubmitted', { payload: { formData } });
            }}
          />
        )}
        {state.matches('authorizedScopes') && (
          <AuthorizedScopes
            meta={{
              kind: state.context.kind,
              residency: state.context.residencyForm,
            }}
            playbook={state.context.playbook ?? playbookValuesToPrefill}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={formData => {
              createPlaybook({
                authorizedScopes: formData,
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
