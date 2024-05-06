import { useRequestErrorToast } from '@onefootprint/hooks';
import { type OnboardingConfigKind } from '@onefootprint/types';
import { Stepper, useToast } from '@onefootprint/ui';
import { useMachine } from '@xstate/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { getAlpacaPlaybookContext } from 'src/pages/playbooks/utils/kind/alpaca';
import { getDocPlaybookContext } from 'src/pages/playbooks/utils/kind/id-doc';
import styled, { css } from 'styled-components';

import { getAuthFixedPayload, isAuth, isIdDoc } from '@/playbooks/utils/kind';
import playbookMachine from '@/playbooks/utils/machine';
import {
  type MachineContext,
  OnboardingTemplate,
  type Personal,
  type VerificationChecksFormData,
} from '@/playbooks/utils/machine/types';

import Name from './components/name-your-playbook';
import OnboardingTemplates from './components/onboarding-templates';
import Residency from './components/residency';
import Summary from './components/summary';
import VerificationChecks from './components/verification-checks';
import WhoToOnboard from './components/who-to-onboard';
import useDefaultValues from './hooks/use-default-values';
import useOptions from './hooks/use-options';
import getCurrentOption from './utils/get-current-option';
import processPlaybook from './utils/process-playbook';
import useCreatePlaybook from './utils/use-create-playbook';

export type RouterProps = {
  onCreate: () => void;
};

const Router = ({ onCreate }: RouterProps) => {
  const [state, send] = useMachine(playbookMachine);
  const { kind, onboardingTemplate } = state.context;
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog',
  });
  const toast = useToast();
  const showRequestError = useRequestErrorToast();
  const mutation = useCreatePlaybook();
  const allOptions = useOptions({
    template: onboardingTemplate,
  });
  const options = allOptions[kind];
  const { currentOption, currentSubOption, isLastStep } = getCurrentOption({
    value: state.value as string,
    options,
  });
  const defaultValues = useDefaultValues(state.context);
  const idDocKinds = state.context.playbook?.personal.idDocKind;
  const countrySpecificIdDocKinds =
    state.context.playbook?.personal.countrySpecificIdDocKind;
  const requiresIdDoc =
    (idDocKinds ?? []).length > 0 ||
    Object.keys(countrySpecificIdDocKinds ?? {}).length > 0;
  const isAlpaca = onboardingTemplate === OnboardingTemplate.Alpaca;

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
      cipKind,
    } = processPlaybook({
      kind,
      nameForm,
      playbook,
      residencyForm,
      template: onboardingTemplate,
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
        cipKind,
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
            } else if (option.value === 'onboardingTemplates') {
              send('templateSelected');
            }
          }}
          value={{ option: currentOption, subOption: currentSubOption }}
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
        {state.matches('onboardingTemplates') && (
          <OnboardingTemplates
            onSubmit={formdata => {
              const { template } = formdata;
              send({
                type: 'onboardingTemplatesSelected',
                payload: { onboardingTemplate: template },
              });
            }}
            onBack={() => {
              send('navigationBackward');
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
              const { allowInternationalResidents } = formData;
              if (allowInternationalResidents) {
                defaultValues.playbook.personal.ssn = false;
                (defaultValues.playbook.personal as Personal).ssnOptional =
                  false;
                (defaultValues.playbook.personal as Personal).ssnKind =
                  undefined;
              }
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
              kind: state.context.kind || defaultValues.playbook.kind,
              residency: state.context.residencyForm || defaultValues.residency,
              onboardingTemplate,
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

              if (isAlpaca && nameForm) {
                const verificationChecksForm = {
                  skipKyc: false,
                  amlFormData: defaultValues.aml,
                };

                const alpacaContext = getAlpacaPlaybookContext(
                  state.context,
                  formData,
                  verificationChecksForm,
                  defaultValues,
                );
                createPlaybook(alpacaContext, verificationChecksForm);
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
