import { Dialog } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import UploadDocForm from './components/upload-doc-form';
import useUploadDoc from './hooks/use-upload-doc';
import type { FormData } from './upload-doc-dialog.types';

export type UploadDocDialogProps = {
  open: boolean;
  onClose: () => void;
};

const UploadDocDialog = ({ open, onClose }: UploadDocDialogProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header-default.actions.upload-doc',
  });
  const { t: allT } = useTranslation('common');
  const mutation = useUploadDoc();

  const handleSubmit = (formData: FormData) => {
    mutation.mutate(
      {
        identifier: `document.custom.${formData.identifier}`,
        file: formData.file,
      },
      {
        onSuccess: onClose,
      },
    );
  };

  return (
    <Dialog
      onClose={onClose}
      open={open}
      size="compact"
      primaryButton={{
        form: 'upload-doc-form',
        label: allT('save'),
        loading: mutation.isPending,
        type: 'submit',
      }}
      secondaryButton={{
        disabled: mutation.isPending,
        label: allT('close'),
        onClick: onClose,
      }}
      title={t('label')}
    >
      <UploadDocForm onSubmit={handleSubmit} />
    </Dialog>
  );
};

export default UploadDocDialog;
