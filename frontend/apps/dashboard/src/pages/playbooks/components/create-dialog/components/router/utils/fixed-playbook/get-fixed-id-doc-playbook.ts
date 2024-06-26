import type {
  DataToCollectFormData,
  MachineContext,
  VerificationChecksFormData,
} from '@/playbooks/utils/machine/types';

export const getFixedIdDocPlaybook = (
  context: MachineContext,
  playbook: DataToCollectFormData,
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
