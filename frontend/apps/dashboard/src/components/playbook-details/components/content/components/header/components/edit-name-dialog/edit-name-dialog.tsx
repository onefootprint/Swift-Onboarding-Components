import type { OnboardingConfig } from '@onefootprint/types';
import { Dialog } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import useUpdatePlaybook from '@/playbooks/hooks/use-update-playbook';

import type { EditNameFormData } from './components/edit-name-form';
import EditNameForm from './components/edit-name-form';

export type EditNameDialogProps = {
  open: boolean;
  playbook: OnboardingConfig;
  onClose: () => void;
};

const EditNameDialog = ({ open, playbook, onClose }: EditNameDialogProps) => {
  const { t: allT } = useTranslation('common');
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.header.edit-name' });
  const mutation = useUpdatePlaybook();

  const handleSubmit = (formData: EditNameFormData) => {
    mutation.mutate(
      { id: playbook.id, name: formData.name },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
    onClose();
  };

  return (
    <Dialog
      isConfirmation
      size="compact"
      title={t('cta')}
      primaryButton={{
        form: 'edit-playbook-form',
        label: allT('save'),
        loading: mutation.isPending,
        type: 'submit',
      }}
      secondaryButton={{
        label: allT('cancel'),
        onClick: onClose,
        disabled: mutation.isPending,
      }}
      onClose={onClose}
      open={open}
    >
      <EditNameForm formId="edit-playbook-form" playbookName={playbook.name} onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default EditNameDialog;
