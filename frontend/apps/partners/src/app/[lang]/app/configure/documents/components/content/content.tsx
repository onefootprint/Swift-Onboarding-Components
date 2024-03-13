'use client';

import { Button, Divider, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PartnerDocumentTemplate } from '@/config/types';

import List from './components/list';

type ContentProps = { templates: PartnerDocumentTemplate[] };

const Content = ({ templates }: ContentProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'documents' });

  return (
    <>
      <Stack gap={2} marginBottom={7} direction="column">
        <Text variant="heading-2">{t('documents')}</Text>
        <Text variant="body-2" color="secondary">
          {t('docs-to-stay-compliant')}
        </Text>
      </Stack>
      <Stack justifyContent="space-between" align="center">
        <Stack gap={2} direction="column">
          <Text variant="label-1">{t('documents-template')}</Text>
          <Text variant="body-3" color="secondary" maxWidth="770px">
            {t('documents-template-overview')}
          </Text>
        </Stack>
        <Button variant="secondary" size="compact">
          {t('add-document')}
        </Button>
      </Stack>
      <Divider marginTop={5} marginBottom={7} />
      <List templates={templates} />
    </>
  );
};

export default Content;
