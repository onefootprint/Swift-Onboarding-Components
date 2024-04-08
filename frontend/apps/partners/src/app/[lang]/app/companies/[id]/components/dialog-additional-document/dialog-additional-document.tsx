import {
  Dialog,
  Radio,
  Stack,
  Text,
  TextArea,
  TextInput,
} from '@onefootprint/ui';
import { SelectNew } from '@onefootprint/ui/src/components';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import hasOptionRole from '@/helpers/has-option-role';

type RadioValue = 'template' | 'new';
type DialogAdditionalDocumentProps = { isOpen?: boolean; onClose: () => void };

const DialogAdditionalDocument = ({
  isOpen,
  onClose,
}: DialogAdditionalDocumentProps) => {
  const { t } = useTranslation('common');
  const [radio, setRadio] = useState<RadioValue>('template');
  const [docName, setDocName] = useState<string>('');

  const handleClose = (ev?: unknown) => {
    /** The options of <SelectNew /> are rendered outside of the dialog, causing CloseOnClickOutside */
    if (ev instanceof Event && hasOptionRole(ev?.target)) return;
    onClose();
  };

  return isOpen ? (
    <Dialog
      onClose={handleClose}
      open
      primaryButton={{ label: t('invite'), type: 'submit' }}
      secondaryButton={{ label: t('cancel'), onClick: handleClose }}
      size="compact"
      title={t('doc.request-document')}
    >
      <Text variant="label-2" marginBottom={4}>
        {t('doc.how-do-you-want-to-proceed')}
      </Text>
      <Stack gap={4} flexDirection="column" marginBottom={5}>
        <Radio
          checked={radio === 'template'}
          id="radio-add-doc-1"
          label={t('doc.select-from-template')}
          name="radio-add-doc"
          onChange={() => setRadio('template')}
          required
          value="template"
        />
        <Radio
          checked={radio === 'new'}
          id="radio-add-doc-2"
          label={t('doc.configure-it-myself')}
          name="radio-add-doc"
          onChange={() => setRadio('new')}
          required
          value="new"
        />
      </Stack>
      {radio === 'template' ? (
        <SelectNew
          size="compact"
          disabled={false}
          options={[
            { label: 'Privacy Policy', value: 'privacy-policy' },
            { label: 'label 2', value: 'value 2' },
          ]}
          contentWidth="auto"
          label={t('doc.document-template')}
          placeholder={t('select-placeholder')}
          triggerWidth="full"
        />
      ) : (
        <TextInput
          type="text"
          size="compact"
          label={t('document')}
          onChangeText={setDocName}
          placeholder={t('doc.document-name')}
          value={docName}
        />
      )}

      <Stack gap={1} flexDirection="column" marginTop={7}>
        <TextArea
          disabled={false}
          hasError={false}
          hint={undefined}
          label={t('doc.document-description')}
          maxLength={undefined}
          minLength={undefined}
          onChange={() => undefined}
          onChangeText={() => undefined}
          placeholder={t('type-here')}
        />
        <Text variant="caption-1" marginTop={2} color="tertiary">
          {t('doc.customer-prompt')}
        </Text>
      </Stack>
    </Dialog>
  ) : null;
};

export default DialogAdditionalDocument;
