import { useToggle, useTranslation } from '@onefootprint/hooks';
import { RoleScopeKind } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';
import PermissionGate from 'src/components/permission-gate';

import { CREATE_DEFAULT_VALUES } from '@/proxy-configs/constants';

import Dialog from './components/dialog';

const Create = () => {
  const { t } = useTranslation('pages.proxy-configs');
  const [isOpen, open, close] = useToggle(false);

  return (
    <>
      <PermissionGate
        fallbackText={t('create.cta-not-allowed')}
        scopeKind={RoleScopeKind.vaultProxy}
      >
        <Button size="small" variant="secondary" onClick={open}>
          {t('create.cta')}
        </Button>
      </PermissionGate>
      <Dialog
        defaultValues={CREATE_DEFAULT_VALUES}
        onClose={close}
        open={isOpen}
      />
    </>
  );
};

export default Create;
