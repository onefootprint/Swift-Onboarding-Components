import { useRequestErrorToast } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { type OnboardingConfigKind } from '@onefootprint/types';
import { Stepper, useToast } from '@onefootprint/ui';
import { useMachine } from '@xstate/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getDocPlaybookContext } from 'src/pages/playbooks/utils/kind/id-doc';
import styled, { css } from 'styled-components';

import { getAuthFixedPayload, isAuth, isIdDoc } from '@/playbooks/utils/kind';
import playbookMachine from '@/playbooks/utils/machine';
import type {
  MachineContext,
  VerificationChecksFormData,
} from '@/playbooks/utils/machine/types';

import Name from './components/name-your-playbook';
import Residency from './components/residency';
import Summary from './components/summary';
import VerificationChecks from './components/verification-checks';
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
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog',
  });
  const toast = useToast();
  const showRequestError = useRequestErrorToast();
  const mutation = useCreatePlaybook();
  const allOptions = useOptions();
  const options = allOptions[kind];
  const step = getStep({ value: state.value as string });
  const isLastStep = step === options.length - 1;
  const stepperValue = options[step];
  const defaultValues = useDefaultValues(state.context);
  const idDocKinds = state.context.playbook?.personal.idDocKind;
  const countrySpecificIdDocKinds =
    state.context.playbook?.personal.countrySpecificIdDocKind;
  const requiresIdDoc =
    (idDocKinds ?? []).length > 0 ||
    Object.keys(countrySpecificIdDocKinds ?? {}).length > 0;

  const createPlaybook = (
    context: MachineContext,
    verificationChecks: VerificationChecksFormData,
  ) => {
    const { playbook, nameForm, residencyForm } = context;
    const { skipKyc, amlFormData: enhancedAml } = verificationChecks;
    if (!playbook || !nameForm || !enhancedAml) {
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
      skipConfirm,
      docScanForOptionalSsn,
      documentTypesAndCountries,
    } = processPlaybook({
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
        docScanForOptionalSsn,
        enhancedAml,
        internationalCountryRestrictions,
        isDocFirstFlow,
        isNoPhoneFlow,
        kind: kind as unknown as OnboardingConfigKind,
        mustCollectData,
        name,
        optionalData,
        skipKyc,
        skipConfirm,
        documentTypesAndCountries,
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
          <Summary
            defaultValues={defaultValues.playbook}
            meta={{
              kind: state.context.kind,
              residency: state.context.residencyForm,
            }}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={formData => {
              const { nameForm } = state.context;
              if (isIdDoc(state.context.kind) && nameForm) {
                const verificationChecksForm = {
                  skipKyc: true,
                  amlFormData: defaultValues.aml,
                };
                const idDocContext = getDocPlaybookContext(
                  state.context,
                  formData,
                  verificationChecksForm,
                );
                createPlaybook(idDocContext, verificationChecksForm);
                return;
              }

              if (isAuth(formData.kind) && nameForm) {
                const payload = getAuthFixedPayload({ nameForm, ...formData });
                const { verificationChecks, ...ctx } = payload;
                createPlaybook(ctx, verificationChecks);
                return;
              }

              send('playbookSubmitted', { payload: { formData } });
            }}
            isLastStep={isLastStep}
            isLoading={mutation.isLoading}
          />
        )}
        {state.matches('verificationChecks') && (
          <VerificationChecks
            defaultAmlValues={defaultValues.aml}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={formData => {
              send('verificationChecksSubmitted', { payload: { formData } });
              createPlaybook(state.context, formData);
            }}
            isLoading={mutation.isLoading}
            requiresDoc={requiresIdDoc}
            allowInternationalResident={
              state.context.residencyForm?.allowInternationalResidents
            }
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
