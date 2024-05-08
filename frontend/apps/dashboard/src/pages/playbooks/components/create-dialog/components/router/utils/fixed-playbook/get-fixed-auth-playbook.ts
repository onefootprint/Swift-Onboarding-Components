import type {
  MachineContext,
  SummaryFormData,
} from '@/playbooks/utils/machine/types';

export const getFixedAuthPlaybook = (
  obj: SummaryFormData & Pick<MachineContext, 'nameForm'>,
) => ({
  kind: obj.kind,
  nameForm: obj.nameForm,
  playbook: obj,
  residencyForm: {
    allowInternationalResidents: false,
    allowUsResidents: true,
    allowUsTerritories: false,
  },
  verificationChecks: {
    skipKyc: false,
    amlFormData: {
      adverseMedia: false,
      enhancedAml: false,
      ofac: false,
      pep: false,
    },
  },
});

export default getFixedAuthPlaybook;
