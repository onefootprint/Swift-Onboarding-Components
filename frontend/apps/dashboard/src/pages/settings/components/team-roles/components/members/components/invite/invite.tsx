import { useTranslation } from '@onefootprint/hooks';
import { RoleScope } from '@onefootprint/types';
import { Box, Button } from '@onefootprint/ui';
import React, { useState } from 'react';
import PermissionGate from 'src/components/permission-gate';

import Dialog from './components/dialog';

const Invite = () => {
  const { t } = useTranslation('pages.settings.members.invite');
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box>
      <PermissionGate
        scope={RoleScope.orgSettings}
        fallbackText={t('not-allowed')}
      >
        <Button size="small" variant="secondary" onClick={handleOpen}>
          {t('title')}
        </Button>
      </PermissionGate>
      <Dialog onClose={handleClose} open={open} />
    </Box>
  );
};

export default Invite;
