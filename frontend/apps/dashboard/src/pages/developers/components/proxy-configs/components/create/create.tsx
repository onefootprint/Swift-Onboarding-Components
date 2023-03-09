import { useToggle, useTranslation } from '@onefootprint/hooks';
import { RoleScope } from '@onefootprint/types';
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
        // TODO: use the correct permission
        // https://linear.app/footprint/issue/FP-2952/vault-proxy-use-the-correct-permission
        fallbackText={t('header.cta-not-allowed')}
        scope={RoleScope.apiKeys}
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
