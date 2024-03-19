import type {
  MachineContext,
  SummaryFormData,
  VerificationChecksFormData,
} from '../machine/types';

// eslint-disable-next-line import/prefer-default-export
export const getDocPlaybookContext = (
  context: MachineContext,
  playbook: SummaryFormData,
  verificationChecksForm: VerificationChecksFormData,
) => {
  const { kind, nameForm, residencyForm } = context;
  const idDocContext: MachineContext = {
    kind,
    nameForm,
    playbook,
    residencyForm,
    verificationChecksForm,
  };

  return idDocContext;
};
