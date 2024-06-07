import { Dialog, Stack, TextArea } from '@onefootprint/ui';
import { Select } from '@onefootprint/ui/src/components';
import type { FormEvent } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getFormElementValue } from '@/helpers';

type Decision = 'accepted' | 'rejected';
type Option = { label: string; value: Decision };
type DialogReviewDocumentProps = {
  isOpen?: boolean;
  onClose: () => void;
  onSubmit: (fields: { decision: Decision; note: string }) => void;
  options: Option[];
};

const formId = 'form-review-doc-dialog';
const getNote = getFormElementValue('textarea[name="optional-note"]');

const DialogReviewDocument = ({ isOpen, onClose, onSubmit, options }: DialogReviewDocumentProps) => {
  const { t } = useTranslation('common');
  const [decision, setDecision] = useState<Option | undefined>(undefined);

  const handleClose = () => {
    setDecision(undefined);
    onClose();
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (decision?.value) {
      onSubmit({ decision: decision?.value || '', note: getNote(e) });
    }
  };

  return isOpen ? (
    <Dialog
      onClose={handleClose}
      open
      primaryButton={{
        label: t('save'),
        type: 'submit',
        form: formId,
        disabled: !decision?.value,
      }}
      secondaryButton={{ label: t('cancel'), onClick: handleClose }}
      size="compact"
      title={t('doc.review-document')}
    >
      <form onSubmit={handleFormSubmit} id={formId}>
        <Select
          disabled={options.length === 0}
          label={t('decision')}
          onChange={setDecision}
          options={options}
          placeholder={t('select-placeholder')}
          size="compact"
          value={decision}
        />
        <Stack gap={1} flexDirection="column" marginTop={7}>
          <TextArea name="optional-note" label={t('optional-note')} placeholder={t('type-here')} />
        </Stack>
      </form>
    </Dialog>
  ) : null;
};

export default DialogReviewDocument;
