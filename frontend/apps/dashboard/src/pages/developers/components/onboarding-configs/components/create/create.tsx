import { useToggle, useTranslation } from '@onefootprint/hooks';
import { RoleScope } from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';
import PermissionGate from 'src/components/permission-gate';

import Dialog from './components/dialog';
import OnboardingConfigMachineProvider from './components/machine-provider';

type CreateProps = {
  onCreate: () => void;
};

const Create = ({ onCreate }: CreateProps) => {
  const { t } = useTranslation('pages.developers.onboarding-configs');
  const [isCreateDialogOpen, openCreateDialog, closeCreateDialog] =
    useToggle(false);

  return (
    <>
      <PermissionGate
        fallbackText={t('cta-not-allowed')}
        scope={RoleScope.onboardingConfiguration}
      >
        <Button onClick={openCreateDialog} variant="secondary" size="small">
          {t('cta')}
        </Button>
      </PermissionGate>
      <OnboardingConfigMachineProvider>
        <Dialog
          open={isCreateDialogOpen}
          onClose={closeCreateDialog}
          onCreate={onCreate}
        />
      </OnboardingConfigMachineProvider>
    </>
  );
};

export default Create;
