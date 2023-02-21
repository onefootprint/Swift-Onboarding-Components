import { useToggle, useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { RoleScope } from '@onefootprint/types';
import { Box, Button } from '@onefootprint/ui';
import React from 'react';
import PermissionGate from 'src/components/permission-gate';
import SectionHeader from 'src/components/section-header';

import CreateDialog from './components/create-onboarding-config';
import OnboardingConfigsData from './components/onboarding-configs-data';
import OnboardingConfigsError from './components/onboarding-configs-error';
import OnboardingConfigsLoading from './components/onboarding-configs-loading';
import useOnboardingConfigs from './hooks/use-onboarding-configs';

const OnboardingConfigs = () => {
  const { t } = useTranslation('pages.developers.onboarding-configs');
  const [isCreateDialogOpen, openCreateDialog, closeCreateDialog] =
    useToggle(false);
  const { data, error, isLoading, refetch } = useOnboardingConfigs();

  return (
    <section data-testid="onboarding-configs-section">
      <SectionHeader title={t('header.title')} subtitle={t('header.subtitle')}>
        <PermissionGate
          fallbackText={t('header.cta-not-allowed')}
          scope={RoleScope.onboardingConfiguration}
        >
          <Button onClick={openCreateDialog} variant="secondary" size="small">
            {t('header.cta')}
          </Button>
        </PermissionGate>
      </SectionHeader>
      <Box sx={{ marginY: 5 }} />
      {data && <OnboardingConfigsData data={data} />}
      {isLoading && <OnboardingConfigsLoading />}
      {error && <OnboardingConfigsError message={getErrorMessage(error)} />}
      <CreateDialog
        open={isCreateDialogOpen}
        onClose={closeCreateDialog}
        onCreate={refetch}
      />
    </section>
  );
};

export default OnboardingConfigs;
