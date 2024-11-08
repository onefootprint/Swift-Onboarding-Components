import { Dialog, Select } from '@onefootprint/ui';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Option = { label: string; value: string };
type DialogAssignProps = {
  docId?: string;
  isOpen?: boolean;
  onClose: () => void;
  onSubmit: (fields: { docId: string; userId?: string }) => void;
  options: Option[];
};

const formId = 'form-assign-doc-dialog';

const DialogAssign = ({ docId, isOpen, onClose, onSubmit, options }: DialogAssignProps) => {
  const { t } = useTranslation('common');
  const [member, setMember] = useState<Option>();

  const handleClose = () => {
    setMember(undefined);
    onClose();
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!docId) return;
    onSubmit({ docId, userId: member?.value || undefined });
  };

  return isOpen ? (
    <Dialog
      onClose={handleClose}
      open
      primaryButton={{ label: t('save'), type: 'submit', form: formId }}
      secondaryButton={{ label: t('cancel'), onClick: handleClose }}
      size="compact"
      title={t('doc.assign-document')}
    >
      <form onSubmit={handleFormSubmit} id={formId}>
        <Select
          label={t('assign-to')}
          onChange={setMember}
          options={options}
          placeholder={t('select-placeholder')}
          value={member}
        />
      </form>
    </Dialog>
  ) : null;
};

export default DialogAssign;
