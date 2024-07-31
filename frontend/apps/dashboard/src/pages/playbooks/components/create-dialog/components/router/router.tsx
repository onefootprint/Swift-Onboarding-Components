import { useRequestErrorToast } from '@onefootprint/hooks';
import { DocumentRequestKind, type OnboardingConfigKind } from '@onefootprint/types';
import { Stepper, useToast } from '@onefootprint/ui';
import { useMachine } from '@xstate/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { isAuth, isDocOnly } from '@/playbooks/utils/kind';
import playbookMachine from '@/playbooks/utils/machine';
import type {
  DataToCollectFormData,
  MachineContext,
  Personal,
  VerificationChecksFormData,
} from '@/playbooks/utils/machine/types';
import { OnboardingTemplate } from '@/playbooks/utils/machine/types';

import DataToCollect from './components/data-to-collect';
import Name from './components/name';
import OnboardingTemplates from './components/onboarding-templates';
import Residency from './components/residency';
import SettingsAuth from './components/settings-auth';
import VerificationChecks from './components/verification-checks';
import WhoToOnboard from './components/who-to-onboard';
import useCreatePlaybook from './hooks/use-create-playbook';
import useOptions from './hooks/use-options';
import { getFixedAuthPlaybook, getFixedIdDocPlaybook, getFixedTemplatePlaybook } from './utils/fixed-playbook';
import getCurrentOption from './utils/get-current-option';
import getDefaultValues from './utils/get-default-values';
import processPlaybook from './utils/process-playbook';

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
  const defaultValues = getDefaultValues(state.context);
  const idDocKinds = state.context.playbook?.personal.docs.global;
  const countrySpecificIdDocKinds = state.context.playbook?.personal.docs.country;
  const requiresIdDoc = (idDocKinds ?? []).length > 0 || Object.keys(countrySpecificIdDocKinds ?? {}).length > 0;

  const createPlaybook = (
    context: MachineContext,
    {
      amlFormData: enhancedAml,
      kybKind,
      kycOptionForBeneficialOwners,
      runKyb,
      skipKyc: shouldSkipKyc,
    }: VerificationChecksFormData,
  ) => {
    const { playbook, nameForm, residencyForm } = context;
    if (!playbook || !nameForm || !enhancedAml) {
      return;
    }

    const {
      allowInternationalResidents,
      allowUsResidents,
      allowUsTerritories,
      canAccessData,
      cipKind,
      documentsToCollect,
      documentTypesAndCountries,
      internationalCountryRestrictions,
      isDocFirstFlow,
      isNoPhoneFlow,
      mustCollectData,
      name,
      optionalData,
      skipConfirm,
      skipKyc,
      verificationChecks,
    } = processPlaybook({
      kind,
      nameForm,
      playbook,
      residencyForm,
      template: onboardingTemplate,
      verificationChecks: {
        kyb: {
          skip: !runKyb,
          kind: kybKind,
        },
      },
      skipKyc: shouldSkipKyc,
      kycOptionForBeneficialOwners,
    });

    mutation.mutate(
      {
        allowInternationalResidents,
        allowUsResidents,
        allowUsTerritories,
        canAccessData,
        cipKind,
        documentsToCollect,
        documentTypesAndCountries,
        enhancedAml,
        internationalCountryRestrictions,
        isDocFirstFlow,
        isNoPhoneFlow,
        kind: kind as unknown as OnboardingConfigKind,
        mustCollectData,
        name,
        optionalData,
        skipConfirm,
        skipKyc,
        verificationChecks,
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

  const createFixedTemplatePlaybook = (
    verificationChecksForm: VerificationChecksFormData,
    formData: DataToCollectFormData,
  ) => {
    const context = getFixedTemplatePlaybook(state.context, formData, verificationChecksForm, defaultValues);
    createPlaybook(context, verificationChecksForm);
  };

  const handleAuthSubmitted = (formData: DataToCollectFormData) => {
    const { nameForm } = state.context;
    const payload = getFixedAuthPlaybook({ nameForm, ...formData });
    const { verificationChecks, ...ctx } = payload;
    createPlaybook(ctx, verificationChecks);
  };

  const handleSubmitDataToCollect = (formData: DataToCollectFormData) => {
    const { nameForm } = state.context;
    if (isDocOnly(state.context.kind) && nameForm) {
      const verificationChecksForm = {
        skipKyc: true,
        amlFormData: defaultValues.aml,
      };
      const idDocContext = getFixedIdDocPlaybook(state.context, formData, verificationChecksForm);
      createPlaybook(idDocContext, verificationChecksForm);
      return;
    }

    if (onboardingTemplate === OnboardingTemplate.Alpaca && nameForm) {
      const verificationChecksForm = {
        skipKyc: false,
        amlFormData: defaultValues.aml,
      };
      createFixedTemplatePlaybook(verificationChecksForm, formData);
      return;
    }

    if (onboardingTemplate === OnboardingTemplate.Apex && nameForm) {
      const verificationChecksForm = {
        skipKyc: false,
        amlFormData: defaultValues.aml,
      };
      createFixedTemplatePlaybook(verificationChecksForm, formData);
      return;
    }

    send('playbookSubmitted', { payload: { formData } });
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
            } else if (option.value === 'settingsPerson') {
              send('settingsPersonSelected');
            } else if (option.value === 'settingBusiness') {
              send('settingBusinessSelected');
            } else if (option.value === 'settingsBo') {
              send('settingsBoSelected');
            } else if (option.value === 'settingsDocOnly') {
              send('settingsDocOnlySelected');
            } else if (option.value === 'settingsAuth') {
              send('settingsAuthSelected');
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
                (defaultValues.playbook.personal as Personal).ssnOptional = false;
                (defaultValues.playbook.personal as Personal).ssnKind = undefined;
              }
              send('residencySubmitted', {
                payload: { formData },
              });
            }}
          />
        )}
        {state.matches('nameYourPlaybook') && (
          <Name
            meta={{
              kind: state.context.kind || defaultValues.playbook.kind,
            }}
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
        {state.matches('settingsAuth') && (
          <SettingsAuth
            defaultValues={defaultValues.playbook}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={handleAuthSubmitted}
            isLoading={mutation.isLoading}
          />
        )}
        {state.matches('settingsPerson') && (
          <DataToCollect
            defaultValues={defaultValues.playbook}
            meta={{
              kind: state.context.kind || defaultValues.playbook.kind,
              residency: state.context.residencyForm || defaultValues.residency,
              onboardingTemplate,
            }}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={handleSubmitDataToCollect}
            isLastStep={isLastStep}
            isLoading={mutation.isLoading}
          />
        )}
        {state.matches('settingsBusiness') && (
          <DataToCollect
            defaultValues={defaultValues.playbook}
            meta={{
              kind: state.context.kind || defaultValues.playbook.kind,
              residency: state.context.residencyForm || defaultValues.residency,
              onboardingTemplate,
            }}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={handleSubmitDataToCollect}
            isLastStep={isLastStep}
            isLoading={mutation.isLoading}
          />
        )}
        {state.matches('settingsBo') && (
          <DataToCollect
            defaultValues={defaultValues.playbook}
            meta={{
              kind: state.context.kind || defaultValues.playbook.kind,
              residency: state.context.residencyForm || defaultValues.residency,
              onboardingTemplate,
            }}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={handleSubmitDataToCollect}
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
            allowInternationalResident={state.context.residencyForm?.allowInternationalResidents}
            isKyb={state.context.kind === 'kyb'}
            collectBO={state.context.playbook?.businessInformation?.business_beneficial_owners}
            businessInfo={state.context.playbook?.businessInformation}
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
    grid-template-areas: "stepper content .";
  }
`;

export default Router;
