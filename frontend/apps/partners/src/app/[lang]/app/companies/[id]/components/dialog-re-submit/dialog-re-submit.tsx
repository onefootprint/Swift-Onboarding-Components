import { Dialog, Stack, Text, TextArea, TextInput } from '@onefootprint/ui';
import { InlineAlert } from '@onefootprint/ui/src/components';
import type { FormEvent } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getFormElementValue } from '@/helpers';
import type { PartnerDocument } from '@/queries';

type Fields = { description: string; id: string; name: string };
type DialogReSubmitProps = {
  docDialog?: PartnerDocument;
  isOpen?: boolean;
  onClose: () => void;
  onSubmit: (fields: Fields) => void;
};

const formId = 'form-add-additional-doc-dialog';
const getDocName = getFormElementValue('input[name="doc-name"]');
const getDocDesc = getFormElementValue('textarea[name="doc-description"]');

const DialogReSubmit = ({ docDialog, isOpen, onClose, onSubmit }: DialogReSubmitProps) => {
  const { t } = useTranslation('common');

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!docDialog?.id) return;
    onSubmit({
      id: docDialog?.id,
      name: getDocName(e),
      description: getDocDesc(e),
    });
  };

  return isOpen ? (
    <Dialog
      onClose={onClose}
      open
      primaryButton={{ label: t('save'), type: 'submit', form: formId }}
      secondaryButton={{ label: t('cancel'), onClick: onClose }}
      size="compact"
      title={t('doc.request-new-submission')}
    >
      <Stack marginBottom={6}>
        <InlineAlert variant="info">{t('doc.request-new-submission-info')}</InlineAlert>
      </Stack>
      <form onSubmit={handleFormSubmit} id={formId}>
        <TextInput
          type="text"
          name="doc-name"
          label={t('document')}
          placeholder={t('doc.document-name')}
          required
          defaultValue={docDialog?.name || ''}
        />
        <Stack gap={1} flexDirection="column" marginTop={7}>
          <TextArea
            name="doc-description"
            label={t('doc.document-description')}
            placeholder={t('type-here')}
            defaultValue={docDialog?.description || ''}
          />
          <Text variant="caption-1" marginTop={2} color="tertiary">
            {t('doc.customer-prompt')}
          </Text>
        </Stack>
      </form>
    </Dialog>
  ) : null;
};

export default DialogReSubmit;
