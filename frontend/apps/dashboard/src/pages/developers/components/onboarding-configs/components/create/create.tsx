import { useToggle, useTranslation } from '@onefootprint/hooks';
import { RoleScopeKind } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';
import PermissionGate from 'src/components/permission-gate';

import Dialog from './components/dialog';

const Create = () => {
  const { t } = useTranslation('pages.developers.onboarding-configs');
  const [isCreateDialogOpen, openCreateDialog, closeCreateDialog] =
    useToggle(false);

  return (
    <>
      <PermissionGate
        fallbackText={t('cta-not-allowed')}
        scopeKind={RoleScopeKind.onboardingConfiguration}
      >
        <Button onClick={openCreateDialog} variant="secondary" size="small">
          {t('cta')}
        </Button>
      </PermissionGate>
      <Dialog open={isCreateDialogOpen} onClose={closeCreateDialog} />
    </>
  );
};

export default Create;
