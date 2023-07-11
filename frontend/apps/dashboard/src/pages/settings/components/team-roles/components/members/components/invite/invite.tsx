import { useToggle, useTranslation } from '@onefootprint/hooks';
import { RoleScopeKind } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';
import PermissionGate from 'src/components/permission-gate';

import Dialog from './components/dialog';

const Invite = () => {
  const { t } = useTranslation('pages.settings.members.invite');
  const [isOpen, open, close] = useToggle(false);

  return (
    <>
      <PermissionGate
        scopeKind={RoleScopeKind.orgSettings}
        fallbackText={t('not-allowed')}
      >
        <Button size="small" variant="secondary" onClick={open}>
          {t('title')}
        </Button>
      </PermissionGate>
      <Dialog onClose={close} open={isOpen} />
    </>
  );
};

export default Invite;
