import { isAuth, isIdDoc, isKyb, isKyc } from '@/playbooks/utils/kind';
import type { MachineContext } from '@/playbooks/utils/machine/types';
import {
  defaultAmlFormData,
  defaultNameFormData,
  defaultPlaybookValuesAuth,
  defaultPlaybookValuesIdDoc,
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
  defaultResidencyFormData,
} from '@/playbooks/utils/machine/types';

const useDefaultValues = (context: MachineContext) => {
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

  return {
    aml: context.verificationChecksForm?.amlFormData || defaultAmlFormData,
    name: context.nameForm || defaultNameFormData,
    playbook: context.playbook || defaultValues,
    residency:
      isKyc(context.kind) && context.residencyForm
        ? context.residencyForm
        : defaultResidencyFormData,
  };
};

export default useDefaultValues;
