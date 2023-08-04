import { useToggle, useTranslation } from '@onefootprint/hooks';
import { RoleKind, RoleScopeKind } from '@onefootprint/types';
import { Box, Button, Divider } from '@onefootprint/ui';
import React from 'react';
import PermissionGate from 'src/components/permission-gate';
import SectionHeader from 'src/components/section-header';
import CreateDialog from 'src/pages/settings/components/team-roles/components/roles/components/create/components/create-dialog';

import Table from './components/table';

const Roles = () => {
  const { t } = useTranslation('pages.developers.api-keys.roles');
  const [isCreateDialogOpen, openCreateDialog, closeCreateDialog] =
    useToggle(false);

  return (
    <>
      <SectionHeader title={t('header.title')} subtitle={t('header.subtitle')}>
        <PermissionGate
          fallbackText={t('header.cta-not-allowed')}
          scopeKind={RoleScopeKind.apiKeys}
        >
          <Button size="small" variant="secondary" onClick={openCreateDialog}>
            {t('header.cta')}
          </Button>
        </PermissionGate>
      </SectionHeader>
      <Box sx={{ marginTop: 5, marginBottom: 7 }}>
        <Divider />
      </Box>
      <Table />
      <CreateDialog
        open={isCreateDialogOpen}
        handleClose={closeCreateDialog}
        kind={RoleKind.apiKey}
      />
    </>
  );
};

export default Roles;
