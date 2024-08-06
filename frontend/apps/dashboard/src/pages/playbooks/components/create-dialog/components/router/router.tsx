import { useRequestErrorToast } from '@onefootprint/hooks';
import { type OnboardingConfigKind } from '@onefootprint/types';
import { Stepper, media, useToast } from '@onefootprint/ui';
import { useMachine } from '@xstate/react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import playbookMachine from '@/playbooks/utils/machine';
import type {
  DataToCollectFormData,
  MachineContext,
  VerificationChecksFormData,
} from '@/playbooks/utils/machine/types';
import { OnboardingTemplate } from '@/playbooks/utils/machine/types';

import StepRequiredAuthMethods from '@/create-playbook/components/router/components/step-required-auth-methods';
import StepAuth from './components/step-auth';
import StepBO from './components/step-bo';
import StepBusiness from './components/step-business';
import StepDocOnly from './components/step-doc-only';
import StepKind from './components/step-kind';
import StepPerson from './components/step-kyc';
import Name from './components/step-name';
import OnboardingTemplates from './components/step-onboarding-templates';
import StepResidency from './components/step-residency';
import StepVerificationChecks from './components/step-verification-checks';
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
  const { currentOption, currentSubOption } = getCurrentOption({
    value: state.value,
    options,
  });

  const defaultValues = getDefaultValues(state.context);
  const idDocKinds = state.context.playbook?.person.docs.gov.global;
  const countrySpecificIdDocKinds = state.context.playbook?.person.docs.gov.country;
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
      businessDocumentsToCollect,
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
      requiredAuthMethods,
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
        businessDocumentsToCollect,
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
        requiredAuthMethods,
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

  const handleDocOnlySubmitted = (formData: DataToCollectFormData) => {
    const verificationChecksForm = {
      skipKyc: true,
      amlFormData: defaultValues.aml,
    };
    const idDocContext = getFixedIdDocPlaybook(state.context, formData, verificationChecksForm);
    createPlaybook(idDocContext, verificationChecksForm);
  };

  const handleSubmitDataToCollect = (formData: DataToCollectFormData) => {
    const { nameForm } = state.context;
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
            } else if (option.value === 'kind') {
              send('kindSelected');
            } else if (option.value === 'settingsKyc') {
              send('settingsKycSelected');
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
            } else if (option.value === 'personalInfo') {
              send('personalInfoSelected');
            } else if (option.value === 'otpVerifications') {
              send('otpVerificationsSelected');
            }
          }}
          value={{ option: currentOption, subOption: currentSubOption }}
          aria-label={t('stepper.aria-label')}
        />
      </StepperContainer>
      <Content>
        {state.matches('kind') && (
          <StepKind
            defaultKind={state.context.kind}
            onSubmit={payload => {
              send('kindSubmitted', { payload });
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
          <StepResidency
            defaultValues={defaultValues.residency}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={formData => {
              const { allowInternationalResidents } = formData;
              if (allowInternationalResidents) {
                defaultValues.playbook.person.basic.ssn.collect = false;
                defaultValues.playbook.person.basic.ssn.optional = false;
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
        {state.matches({ settingsKyc: 'personalInfo' }) && (
          <StepPerson
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
          />
        )}
        {(state.matches({ settingsKyc: 'otpVerifications' }) || state.matches({ settingsKyb: 'otpVerifications' })) && (
          <StepRequiredAuthMethods
            defaultValues={defaultValues.playbook}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={formData => {
              send('playbookSubmitted', {
                payload: { formData },
              });
            }}
          />
        )}
        {state.matches({ settingsKyb: 'settingsBusiness' }) && (
          <StepBusiness
            defaultValues={defaultValues.playbook}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={formData => {
              send('playbookSubmitted', {
                payload: { formData },
              });
            }}
          />
        )}
        {state.matches({ settingsKyb: 'settingsBo' }) && (
          <StepBO
            meta={{
              kind: state.context.kind || defaultValues.playbook.kind,
              residency: state.context.residencyForm || defaultValues.residency,
              onboardingTemplate,
            }}
            defaultValues={defaultValues.playbook}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={formData => {
              send('playbookSubmitted', {
                payload: { formData },
              });
            }}
          />
        )}
        {state.matches('settingsAuth') && (
          <StepAuth
            defaultValues={defaultValues.playbook}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={handleAuthSubmitted}
            isLoading={mutation.isLoading}
          />
        )}
        {state.matches('settingsDocOnly') && (
          <StepDocOnly
            defaultValues={defaultValues.playbook}
            onBack={() => {
              send('navigationBackward');
            }}
            onSubmit={handleDocOnlySubmitted}
            isLoading={mutation.isLoading}
          />
        )}
        {state.matches('verificationChecks') && (
          <StepVerificationChecks
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
            collectBO={state.context.playbook?.business?.basic.collectBOInfo}
            businessInfo={state.context.playbook?.business}
          />
        )}
      </Content>
    </Container>
  );
};

const StepperContainer = styled.div`
  ${({ theme }) => css`
    display: none;
    
    ${media.greaterThan('md')`
      display: block;
      position: absolute;
      top: ${theme.spacing[3]};
      left: ${theme.spacing[7]};
    `}
  `}
`;

const Content = styled.div`
  max-width: 520px;
  margin: auto;
 
  ${media.greaterThan('md')`
    max-width: 580px;
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    position: relative;
    padding: ${theme.spacing[5]};
  `}
`;

export default Router;
