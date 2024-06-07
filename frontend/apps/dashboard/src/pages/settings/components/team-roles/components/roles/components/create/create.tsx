import { RoleKind, RoleScopeKind } from '@onefootprint/types';
import { Box, Button } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import CreateDialog from 'src/components/roles/create-dialog';

const Create = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.roles.create',
  });
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <Box>
      <PermissionGate scopeKind={RoleScopeKind.orgSettings} fallbackText={t('not-allowed')}>
        <Button onClick={handleOpen} variant="secondary">
          {t('title')}
        </Button>
      </PermissionGate>
      <CreateDialog open={open} handleClose={() => setOpen(false)} kind={RoleKind.dashboardUser} />
    </Box>
  );
};

export default Create;
