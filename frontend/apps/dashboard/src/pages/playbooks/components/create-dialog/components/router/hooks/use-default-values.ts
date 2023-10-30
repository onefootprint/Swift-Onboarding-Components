import type { MachineContext } from '@/playbooks/utils/machine/types';
import {
  defaultAmlFormData,
  defaultNameFormData,
  defaultPlaybookValuesKYB,
  defaultPlaybookValuesKYC,
  defaultResidencyFormData,
  PlaybookKind,
} from '@/playbooks/utils/machine/types';

const useDefaultValues = (context: MachineContext) => {
  const defaultPlaybookValuesByKind =
    context.kind === PlaybookKind.Kyb
      ? defaultPlaybookValuesKYB
      : defaultPlaybookValuesKYC;

  return {
    aml: context.amlForm || defaultAmlFormData,
    name: context.nameForm || defaultNameFormData,
    playbook: context.playbook || defaultPlaybookValuesByKind,
    residency:
      context.kind === PlaybookKind.Kyc && context.residencyForm
        ? context.residencyForm
        : defaultResidencyFormData,
  };
};

export default useDefaultValues;
