import { Dialog, Stack, Text, TextArea, TextInput } from '@onefootprint/ui';
import type { FormEvent } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getFormElementValue } from '@/helpers';

type Fields = { name: string; description: string };
type DialogAddDocumentProps = {
  initialValues?: Fields;
  isOpen?: boolean;
  onClose: () => void;
  onSubmit: ({ name, description }: Fields) => void;
};

const formId = 'form-add-doc-dialog';
const getDocName = getFormElementValue('input[type="text"][name="doc-name"]');
const getDocDesc = getFormElementValue('textarea[name="doc-description"]');

const DialogAddDocument = ({ initialValues, isOpen, onClose, onSubmit }: DialogAddDocumentProps) => {
  const { t } = useTranslation('common');

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ name: getDocName(e), description: getDocDesc(e) });
  };

  return isOpen ? (
    <Dialog
      onClose={onClose}
      open
      primaryButton={{ label: t('save'), type: 'submit', form: formId }}
      secondaryButton={{ label: t('cancel'), onClick: onClose }}
      size="compact"
      title={t('doc.add-document')}
    >
      <form onSubmit={handleFormSubmit} id={formId}>
        <TextInput
          type="text"
          name="doc-name"
          defaultValue={initialValues?.name}
          label={t('document')}
          placeholder={t('doc.document-name')}
          required
          size="compact"
        />
        <Stack gap={1} flexDirection="column" marginTop={7}>
          <TextArea
            name="doc-description"
            defaultValue={initialValues?.description}
            label={t('doc.document-description')}
            placeholder={t('type-here')}
          />
          <Text variant="caption-1" marginTop={2} color="tertiary">
            {t('doc.customer-prompt')}
          </Text>
        </Stack>
      </form>
    </Dialog>
  ) : null;
};

export default DialogAddDocument;
