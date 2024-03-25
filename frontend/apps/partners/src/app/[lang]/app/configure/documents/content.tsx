'use client';

import { Button, Divider, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PartnerDocumentTemplate } from '@/config/types';

import List from './components/document-list';

type ConfigureDocumentsContentProps = { templates: PartnerDocumentTemplate[] };

const ConfigureDocumentsContent = ({
  templates,
}: ConfigureDocumentsContentProps) => {
  const { t } = useTranslation('common');

  return (
    <>
      <Stack gap={2} marginBottom={7} direction="column">
        <Text variant="heading-2">{t('documents')}</Text>
        <Text variant="body-2" color="secondary">
          {t('doc.docs-to-stay-compliant')}
        </Text>
      </Stack>
      <Stack justifyContent="space-between" align="center">
        <Stack gap={2} direction="column">
          <Text variant="label-1">{t('doc.documents-template')}</Text>
          <Text variant="body-3" color="secondary" maxWidth="770px">
            {t('doc.documents-template-overview')}
          </Text>
        </Stack>
        <Button variant="secondary" size="compact">
          {t('doc.add-document')}
        </Button>
      </Stack>
      <Divider marginTop={5} marginBottom={7} />
      <List templates={templates} />
    </>
  );
};

export default ConfigureDocumentsContent;
