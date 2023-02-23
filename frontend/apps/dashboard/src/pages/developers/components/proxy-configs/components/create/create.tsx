import { useTranslation } from '@onefootprint/hooks';
import { RoleScope } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';
import PermissionGate from 'src/components/permission-gate';

const Create = () => {
  const { t } = useTranslation('pages.proxy-configs');

  return (
    <PermissionGate
      fallbackText={t('header.cta-not-allowed')}
      // TODO: use the correct permission
      // https://linear.app/footprint/issue/FP-2952/vault-proxy-use-the-correct-permission
      scope={RoleScope.apiKeys}
    >
      <Button size="small" variant="secondary">
        {t('create.cta')}
      </Button>
    </PermissionGate>
  );
};

export default Create;
