import { isAuth, isIdDoc, isKyb, isKyc } from '@/playbooks/utils/kind';
import type {
  DefaultValues,
  MachineContext,
} from '@/playbooks/utils/machine/types';
import {
  defaultAmlFormData,
  defaultAmlFormDataAlpaca,
  defaultNameFormData,
  defaultPlaybookValuesAlpaca,
  defaultPlaybookValuesAuth,
  defaultPlaybookValuesIdDoc,
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
  defaultResidencyFormData,
  defaultResidencyFormDataAlpaca,
  OnboardingTemplate,
} from '@/playbooks/utils/machine/types';

const useDefaultValues = (context: MachineContext): DefaultValues => {
  const isAlpacaPlaybook =
    context.onboardingTemplate === OnboardingTemplate.Alpaca;
  if (isAuth(context.kind)) {
    return {
      ...defaultPlaybookValuesAuth,
      name: context.nameForm || defaultPlaybookValuesAuth.name,
      playbook: context.playbook || defaultPlaybookValuesAuth.playbook,
    };
  }

  let defaultValues = defaultPlaybookValuesKYC;
  if (isKyb(context.kind)) {
    defaultValues = defaultPlaybookValuesKYB;
  }
  if (isIdDoc(context.kind)) {
    defaultValues = defaultPlaybookValuesIdDoc;
  }
  if (isAlpacaPlaybook) {
    defaultValues = defaultPlaybookValuesAlpaca;
  }

  let defaultAml = defaultAmlFormData;
  if (isAlpacaPlaybook) defaultAml = defaultAmlFormDataAlpaca;

  let residency = defaultResidencyFormData;
  if (isKyc(context.kind) && context.residencyForm) {
    residency = context.residencyForm;
  }
  if (isAlpacaPlaybook) {
    residency = defaultResidencyFormDataAlpaca;
  }

  return {
    aml: context.verificationChecksForm?.amlFormData || defaultAml,
    name: context.nameForm || defaultNameFormData,
    playbook: context.playbook || defaultValues,
    residency,
  };
};

export default useDefaultValues;
