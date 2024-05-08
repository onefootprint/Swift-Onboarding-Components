import type {
  MachineContext,
  SummaryFormData,
  VerificationChecksFormData,
} from '@/playbooks/utils/machine/types';

export const getFixedIdDocPlaybook = (
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

export default getFixedIdDocPlaybook;
