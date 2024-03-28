import type {
  DefaultValues,
  MachineContext,
  SummaryFormData,
  VerificationChecksFormData,
} from '../machine/types';

// eslint-disable-next-line import/prefer-default-export
export const getAlpacaPlaybookContext = (
  context: MachineContext,
  playbook: SummaryFormData,
  verificationChecksForm: VerificationChecksFormData,
  defaultValues: DefaultValues,
) => {
  let { kind, nameForm, residencyForm } = context;
  kind = kind || defaultValues.playbook.kind;
  nameForm = nameForm || defaultValues.name;
  residencyForm = residencyForm || defaultValues.residency;
  const alpacaContext: MachineContext = {
    kind,
    nameForm,
    playbook,
    residencyForm,
    verificationChecksForm,
  };

  return alpacaContext;
};
