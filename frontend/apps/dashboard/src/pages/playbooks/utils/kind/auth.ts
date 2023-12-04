import type {
  AuthorizedScopesFormData,
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
  authorizedScopesForm: {
    email: true,
    phone_number: true,
  } as unknown as AuthorizedScopesFormData,
  residencyForm: {
    allowInternationalResidents: false,
    allowUsResidents: true,
    allowUsTerritories: false,
  },
  enhancedAml: {
    adverseMedia: false,
    enhancedAml: false,
    ofac: false,
    pep: false,
  },
});
