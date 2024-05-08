import type {
  DefaultValues,
  MachineContext,
  SummaryFormData,
  VerificationChecksFormData,
} from '@/playbooks/utils/machine/types';

const getFixedTemplatePlaybook = (
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

export default getFixedTemplatePlaybook;
