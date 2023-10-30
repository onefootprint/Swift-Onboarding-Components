import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import styled, { css } from '@onefootprint/styled';
import { Stepper, useToast } from '@onefootprint/ui';
import { useMachine } from '@xstate/react';
import React from 'react';

import playbookMachine from '@/playbooks/utils/machine';
import type { AMLFormData } from '@/playbooks/utils/machine/types';

import AML from './components/aml';
import AuthorizedScopes from './components/authorized-scopes';
import Name from './components/name-your-playbook';
import Residency from './components/residency';
import Config from './components/summary';
import WhoToOnboard from './components/who-to-onboard';
import useDefaultValues from './hooks/use-default-values';
import useOptions from './hooks/use-options';
import getStep from './utils/get-step';
import processPlaybook from './utils/process-playbook';
import useCreatePlaybook from './utils/use-create-playbook';

export type RouterProps = {
  onCreate: () => void;
};

const Router = ({ onCreate }: RouterProps) => {
  const [state, send] = useMachine(playbookMachine);
  const { kind } = state.context;
  const { t } = useTranslation('pages.playbooks.dialog');
  const toast = useToast();
  const showRequestError = useRequestErrorToast();
  const mutation = useCreatePlaybook();
  const allOptions = useOptions();
  const options = allOptions[kind];
  const step = getStep({ value: state.value as string });
  const stepperValue = options[step];
  const defaultValues = useDefaultValues(state.context);

  const createPlaybook = (enhancedAml: AMLFormData) => {
    const { playbook, nameForm, residencyForm, authorizedScopesForm } =
      state.context;

    if (!playbook || !nameForm || !authorizedScopesForm || !enhancedAml) {
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
      docScanForOptionalSsn,
    } = processPlaybook({
      authorizedScopes: authorizedScopesForm,
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
        enhancedAml,
        docScanForOptionalSsn,
      },
      {
        onSuccess: () => {
          toast.show({
            title: t('feedback.success.title'),
            description: t('feedback.success.description'),
          });
          onCreate();
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
              send('summarySelected');
            } else if (option.value === 'authorizedScopes') {
              send('authorizedScopesSelected');
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
            defaultValues={defaultValues.residency}
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
          <Name
            kind={state.context.kind}
            defaultValues={defaultValues.name}
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
          <Config
            defaultValues={defaultValues.playbook}
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
            playbook={state.context.playbook ?? defaultValues.playbook}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={formData => {
              send('authorizedScopesSubmitted', { payload: { formData } });
            }}
          />
        )}
        {state.matches('aml') && (
          <AML
            defaultValues={defaultValues.aml}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={formData => {
              send('amlSubmitted', { payload: { formData } });
              createPlaybook(formData);
            }}
            isLoading={mutation.isLoading}
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
