import { useToggle } from '@onefootprint/hooks';
import { RoleScopeKind } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import { CREATE_DEFAULT_VALUES } from 'src/pages/proxy-configs/constants';

import Dialog from './components/dialog';

const Create = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.proxy-configs' });
  const [isOpen, open, close] = useToggle(false);

  return (
    <>
      <PermissionGate fallbackText={t('create.cta-not-allowed')} scopeKind={RoleScopeKind.manageVaultProxy}>
        <Button variant="primary" onClick={open}>
          {t('create.cta')}
        </Button>
      </PermissionGate>
      <Dialog defaultValues={CREATE_DEFAULT_VALUES} onClose={close} open={isOpen} />
    </>
  );
};

export default Create;
