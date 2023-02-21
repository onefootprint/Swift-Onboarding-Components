import { useToggle, useTranslation } from '@onefootprint/hooks';
import { Box, Button } from '@onefootprint/ui';
import React from 'react';
import PermissionGate, { Scope } from 'src/components/permission-gate';
import SectionHeader from 'src/components/section-header/section-header';

import CreateDialog from './components/create-dialog';
import Table from './components/table';

const ApiKeys = () => {
  const { t } = useTranslation('pages.developers.api-keys');
  const [isCreateDialogOpen, openCreateDialog, closeCreateDialog] =
    useToggle(false);

  return (
    <section data-testid="api-keys-section">
      <SectionHeader title={t('header.title')} subtitle={t('header.subtitle')}>
        <PermissionGate
          fallbackText={t('header.cta-not-allowed')}
          scope={Scope.apiKeys}
        >
          <Button onClick={openCreateDialog} size="small" variant="secondary">
            {t('header.cta')}
          </Button>
        </PermissionGate>
      </SectionHeader>
      <Box sx={{ marginY: 5 }} />
      <Table />
      <CreateDialog open={isCreateDialogOpen} onClose={closeCreateDialog} />
    </section>
  );
};

export default ApiKeys;
