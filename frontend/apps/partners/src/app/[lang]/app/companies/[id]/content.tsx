'use client';

import { IcoFileText24 } from '@onefootprint/icons';
import { Box, Breadcrumb, Button, Stack, Text } from '@onefootprint/ui';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { PartnerDocument, SecurityChecks } from '@/config/types';

import List from './components/company-doc-list';
import DialogAdditionalDocument from './components/dialog-additional-document';
import DialogAssign from './components/dialog-assign';
import DrawerTimeline from './components/drawer-timeline';
import Progress from './components/progress';
import Checks from './components/security-checks';
import useOverlayState from './state/use-overlay-state';

type CompanyPageContentProps = {
  documents: PartnerDocument[];
  documentsStatus: { accepted: number; count: number; percentage: number };
  securityChecks: SecurityChecks;
};

const resetBodyPointerEvents = () => {
  document.body.style.pointerEvents = '';
};

const initialOverlayState = {
  docAdditional: false,
  docAssign: false,
  docTimeline: false,
};

const CompanyPageContent = ({
  documents,
  documentsStatus,
  securityChecks,
}: CompanyPageContentProps) => {
  const { t } = useTranslation('common');
  const overlays = useOverlayState(initialOverlayState);

  /**
   * body pointer-events: none remains after closing
   * https://github.com/radix-ui/primitives/issues/1241
   * https://github.com/radix-ui/primitives/issues/1263
   * */
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!overlays.docTimeline) {
      window.setTimeout(resetBodyPointerEvents, 0);
    }
  }, [overlays.docTimeline]);

  return (
    <>
      <Box tag="main">
        <Breadcrumb.List
          aria-label={t('companies.company-details-breadcrumb')}
          marginBottom={7}
        >
          <Breadcrumb.Item href="/app/companies" as={Link}>
            {t('companies.companies')}
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
          <Button
            variant="secondary"
            size="compact"
            onClick={overlays.docAdditionalToggle}
          >
            {t('doc.request-document')}
          </Button>
        </Stack>
        <Box marginBlock={5}>
          <Progress
            value={documentsStatus.percentage}
            details={`${documentsStatus.accepted}/${documentsStatus.count} ${t(
              'companies.completed-controls',
            )}`}
          />
        </Box>
        <Box marginBottom={8}>
          <List
            documents={documents}
            handlers={{
              onAssignClick: overlays.docAssignToggle,
              onReviewClick: overlays.docTimelineToggle,
            }}
          />
        </Box>
        <Checks securityChecks={securityChecks} />
      </Box>
      <DialogAdditionalDocument
        isOpen={overlays.docAdditional}
        onClose={overlays.docAdditionalToggle}
      />
      <DialogAssign
        isOpen={overlays.docAssign}
        onClose={overlays.docAssignToggle}
      />
      <DrawerTimeline
        isOpen={overlays.docTimeline}
        onClose={overlays.docTimelineToggle}
      />
    </>
  );
};

export default CompanyPageContent;
