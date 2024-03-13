'use client';

import { IcoFileText24 } from '@onefootprint/icons';
import { Box, Breadcrumb, Button, Stack, Text } from '@onefootprint/ui';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { PartnerDocument, SecurityChecks } from '@/config/types';

import Checks from './components/checks';
import List from './components/list';
import Progress from './components/progress';

type ContentProps = {
  documents: PartnerDocument[];
  documentsStatus: {
    accepted: number;
    count: number;
    percentage: number;
  };
  securityChecks: SecurityChecks;
};

const Content = ({
  documents,
  documentsStatus,
  securityChecks,
}: ContentProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'companies' });

  return (
    <Box tag="main">
      <Breadcrumb.List
        aria-label={t('company-details-breadcrumb')}
        marginBottom={7}
      >
        <Breadcrumb.Item href="/app/companies" as={Link}>
          {t('companies')}
        </Breadcrumb.Item>
        <Breadcrumb.Item>{t('company')}</Breadcrumb.Item>
      </Breadcrumb.List>
      <Stack tag="header" justify="space-between" align="center">
        <Stack gap={2}>
          <IcoFileText24 />
          <Text variant="label-2" tag="h2">
            {t('documents')}
          </Text>
        </Stack>
        <Button variant="secondary" size="compact">
          {t('request-additional-document')}
        </Button>
      </Stack>
      <Box marginBlock={5}>
        <Progress
          value={documentsStatus.percentage}
          details={`${documentsStatus.accepted}/${documentsStatus.count} ${t(
            'completed-controls',
          )}`}
        />
      </Box>
      <Box marginBottom={8}>
        <List documents={documents} />
      </Box>
      <Checks securityChecks={securityChecks} />
    </Box>
  );
};
export default Content;
