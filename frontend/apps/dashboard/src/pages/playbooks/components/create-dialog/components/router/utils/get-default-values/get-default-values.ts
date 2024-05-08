import { isAuth, isIdDoc, isKyb, isKyc } from '@/playbooks/utils/kind';
import type {
  DefaultValues,
  MachineContext,
} from '@/playbooks/utils/machine/types';
import {
  defaultAmlFormData,
  defaultAmlFormDataAlpaca,
  defaultAmlFormDataApex,
  defaultNameFormData,
  defaultPlaybookValuesAlpaca,
  defaultPlaybookValuesApex,
  defaultPlaybookValuesAuth,
  defaultPlaybookValuesIdDoc,
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
  defaultResidencyFormData,
  defaultResidencyFormDataAlpaca,
  defaultResidencyFormDataApex,
  OnboardingTemplate,
} from '@/playbooks/utils/machine/types';

const templateToDefaultValuesKYC = {
  [OnboardingTemplate.Alpaca]: defaultPlaybookValuesAlpaca,
  [OnboardingTemplate.Apex]: defaultPlaybookValuesApex,
  [OnboardingTemplate.Custom]: defaultPlaybookValuesKYC,
};

const templateToDefaultAml = {
  [OnboardingTemplate.Alpaca]: defaultAmlFormDataAlpaca,
  [OnboardingTemplate.Apex]: defaultAmlFormDataApex,
  [OnboardingTemplate.Custom]: defaultAmlFormData,
};

const templateToDefaultResidency = {
  [OnboardingTemplate.Alpaca]: defaultResidencyFormDataAlpaca,
  [OnboardingTemplate.Apex]: defaultResidencyFormDataApex,
  [OnboardingTemplate.Custom]: defaultResidencyFormData,
};

const getDefaultValues = (context: MachineContext): DefaultValues => {
  const onboardingTemplate =
    context.onboardingTemplate || OnboardingTemplate.Custom;
  if (isAuth(context.kind)) {
    return {
      ...defaultPlaybookValuesAuth,
      name: context.nameForm || defaultPlaybookValuesAuth.name,
      playbook: context.playbook || defaultPlaybookValuesAuth.playbook,
    };
  }

  let defaultValues = templateToDefaultValuesKYC[onboardingTemplate];
  if (isKyb(context.kind)) {
    defaultValues = defaultPlaybookValuesKYB;
  }
  if (isIdDoc(context.kind)) {
    defaultValues = defaultPlaybookValuesIdDoc;
  }

  const defaultAml = templateToDefaultAml[onboardingTemplate];

  let residency = templateToDefaultResidency[onboardingTemplate];
  if (isKyc(context.kind) && context.residencyForm) {
    residency = context.residencyForm;
  }

  return {
    aml: context.verificationChecksForm?.amlFormData || defaultAml,
    name: context.nameForm || defaultNameFormData,
    playbook: context.playbook || defaultValues,
    residency,
  };
};

export default getDefaultValues;
