import type {
  MachineContext,
  SummaryFormData,
} from '@/playbooks/utils/machine/types';

// eslint-disable-next-line import/prefer-default-export
export const getAuthFixedPayload = (
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
