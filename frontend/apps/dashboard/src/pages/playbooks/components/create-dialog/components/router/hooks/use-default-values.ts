import { isAuth, isKyb, isKyc } from '@/playbooks/utils/kind';
import type { MachineContext } from '@/playbooks/utils/machine/types';
import {
  defaultAmlFormData,
  defaultNameFormData,
  defaultPlaybookValuesAuth,
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

  const defaultValues = isKyb(context.kind)
    ? defaultPlaybookValuesKYB
    : defaultPlaybookValuesKYC;

  return {
    aml: context.amlForm || defaultAmlFormData,
    name: context.nameForm || defaultNameFormData,
    playbook: context.playbook || defaultValues,
    residency:
      isKyc(context.kind) && context.residencyForm
        ? context.residencyForm
        : defaultResidencyFormData,
  };
};

export default useDefaultValues;
