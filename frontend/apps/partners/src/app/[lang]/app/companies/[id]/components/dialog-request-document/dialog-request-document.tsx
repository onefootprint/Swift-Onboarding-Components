import { Dialog, Radio, Stack, Text, TextArea, TextInput } from '@onefootprint/ui';
import { Select } from '@onefootprint/ui/src/components';
import type { FormEvent } from 'react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getFormElementValue } from '@/helpers';
import type { PartnerDocument } from '@/queries';

type RadioValue = 'template' | 'new';
type Option = { label: string; value: string };
type Fields = {
  name: string;
  description: string;
  id?: string;
  templateId?: string;
};
type DialogRequestDocumentProps = {
  docDialog?: PartnerDocument;
  isOpen?: boolean;
  onClose: () => void;
  onSubmit: (fields: Fields) => void;
  options: Option[];
  title: string;
};

const formId = 'form-request-doc-dialog';
const getDocName = getFormElementValue('input[name="doc-name"]');
const getDocDesc = getFormElementValue('textarea[name="doc-description"]');

const DialogRequestDocument = ({
  docDialog,
  isOpen,
  onClose,
  onSubmit,
  options,
  title,
}: DialogRequestDocumentProps) => {
  const prevName = docDialog?.name;
  const prevDesc = docDialog?.description;
  const isRadioDisabled = Boolean(docDialog?.name);
  const { t } = useTranslation('common');
  const [template, setTemplate] = useState<Option>();
  const [radio, setRadio] = useState<RadioValue>(() => (prevName ? 'new' : 'template'));

  const handleClose = () => {
    setRadio('template');
    setTemplate(undefined);
    onClose();
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      name: radio === 'new' ? getDocName(e) : template?.label || '',
      description: getDocDesc(e),
      id: docDialog?.id,
      templateId: template?.value,
    });
  };

  return isOpen ? (
    <Dialog
      onClose={handleClose}
      open
      primaryButton={{ label: t('save'), type: 'submit', form: formId }}
      secondaryButton={{ label: t('cancel'), onClick: handleClose }}
      size="compact"
      title={title}
    >
      {isRadioDisabled ? null : (
        <Text variant="label-2" marginBottom={4}>
          {t('doc.how-do-you-want-to-proceed')}
        </Text>
      )}
      <form onSubmit={handleFormSubmit} id={formId}>
        {isRadioDisabled ? null : (
          <Stack gap={4} flexDirection="column" marginBottom={5}>
            <Radio
              checked={radio === 'template'}
              id="radio-add-doc-1"
              label={t('doc.select-from-template')}
              name="radio-add-doc"
              onChange={() => setRadio('template')}
              required
              disabled={isRadioDisabled}
              value="template"
            />
            <Radio
              checked={radio === 'new'}
              id="radio-add-doc-2"
              label={t('doc.configure-it-myself')}
              name="radio-add-doc"
              onChange={() => setRadio('new')}
              required
              disabled={isRadioDisabled}
              value="new"
            />
          </Stack>
        )}
        {radio === 'template' ? (
          <Select
            disabled={options.length === 0}
            label={t('doc.document-template')}
            onChange={setTemplate}
            options={options}
            emptyStateText={t('no-results-found')}
            placeholder={t('select-placeholder')}
            searchPlaceholder={t('search-placeholder')}
            value={template}
          />
        ) : (
          <TextInput
            type="text"
            name="doc-name"
            label={t('document')}
            placeholder={t('doc.document-name')}
            defaultValue={prevName || ''}
            required
          />
        )}

        <Stack gap={1} flexDirection="column" marginTop={7}>
          <TextArea
            name="doc-description"
            label={t('doc.document-description')}
            placeholder={t('type-here')}
            defaultValue={prevDesc || ''}
          />
          <Text variant="caption-1" marginTop={2} color="tertiary">
            {t('doc.customer-prompt')}
          </Text>
        </Stack>
      </form>
    </Dialog>
  ) : null;
};

export default DialogRequestDocument;
