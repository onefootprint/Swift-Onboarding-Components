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
        fallbackText={t('header.cta-not-allowed')}
        scope={RoleScope.onboardingConfiguration}
      >
        <Button onClick={openCreateDialog} variant="secondary" size="small">
          {t('header.cta')}
        </Button>
      </PermissionGate>
      <OnboardingConfigMachineProvider>
        <Dialog
          hideKyb // TODO: comment this out if you want to test out the KYB flows
          open={isCreateDialogOpen}
          onClose={closeCreateDialog}
          onCreate={onCreate}
        />
      </OnboardingConfigMachineProvider>
    </>
  );
};

export default Create;
