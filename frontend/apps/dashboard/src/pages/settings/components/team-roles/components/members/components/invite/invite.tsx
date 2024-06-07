import { useToggle } from '@onefootprint/hooks';
import { RoleScopeKind } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';

import Dialog from './components/dialog';

const Invite = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.settings.members.invite',
  });
  const [isOpen, open, close] = useToggle(false);

  return (
    <>
      <PermissionGate scopeKind={RoleScopeKind.orgSettings} fallbackText={t('not-allowed')}>
        <Button variant="secondary" onClick={open}>
          {t('title')}
        </Button>
      </PermissionGate>
      <Dialog onClose={close} open={isOpen} />
    </>
  );
};

export default Invite;
