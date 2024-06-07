import { isAuth, isIdDoc, isKyb, isKyc } from '@/playbooks/utils/kind';
import type { DefaultValues, MachineContext } from '@/playbooks/utils/machine/types';
import {
  OnboardingTemplate,
  defaultAmlFormData,
  defaultAmlFormDataAlpaca,
  defaultAmlFormDataApex,
  defaultAmlFormDataCarRental,
  defaultAmlFormDataCreditCard,
  defaultAmlFormDataTenantScreening,
  defaultNameFormData,
  defaultPlaybookValuesAlpaca,
  defaultPlaybookValuesApex,
  defaultPlaybookValuesAuth,
  defaultPlaybookValuesCarRental,
  defaultPlaybookValuesCreditCard,
  defaultPlaybookValuesIdDoc,
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
  defaultPlaybookValuesTenantScreening,
  defaultResidencyFormData,
  defaultResidencyFormDataAlpaca,
  defaultResidencyFormDataApex,
  defaultResidencyFormDataCarRental,
  defaultResidencyFormDataCreditCard,
  defaultResidencyFormDataTenantScreening,
} from '@/playbooks/utils/machine/types';

const templateToDefaultValuesKYC = {
  [OnboardingTemplate.Alpaca]: defaultPlaybookValuesAlpaca,
  [OnboardingTemplate.Apex]: defaultPlaybookValuesApex,
  [OnboardingTemplate.Custom]: defaultPlaybookValuesKYC,
  [OnboardingTemplate.TenantScreening]: defaultPlaybookValuesTenantScreening,
  [OnboardingTemplate.CarRental]: defaultPlaybookValuesCarRental,
  [OnboardingTemplate.CreditCard]: defaultPlaybookValuesCreditCard,
};

const templateToDefaultAml = {
  [OnboardingTemplate.Alpaca]: defaultAmlFormDataAlpaca,
  [OnboardingTemplate.Apex]: defaultAmlFormDataApex,
  [OnboardingTemplate.Custom]: defaultAmlFormData,
  [OnboardingTemplate.TenantScreening]: defaultAmlFormDataTenantScreening,
  [OnboardingTemplate.CarRental]: defaultAmlFormDataCarRental,
  [OnboardingTemplate.CreditCard]: defaultAmlFormDataCreditCard,
};

const templateToDefaultResidency = {
  [OnboardingTemplate.Alpaca]: defaultResidencyFormDataAlpaca,
  [OnboardingTemplate.Apex]: defaultResidencyFormDataApex,
  [OnboardingTemplate.Custom]: defaultResidencyFormData,
  [OnboardingTemplate.TenantScreening]: defaultResidencyFormDataTenantScreening,
  [OnboardingTemplate.CarRental]: defaultResidencyFormDataCarRental,
  [OnboardingTemplate.CreditCard]: defaultResidencyFormDataCreditCard,
};

const getDefaultValues = (context: MachineContext): DefaultValues => {
  const onboardingTemplate = context.onboardingTemplate || OnboardingTemplate.Custom;
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
