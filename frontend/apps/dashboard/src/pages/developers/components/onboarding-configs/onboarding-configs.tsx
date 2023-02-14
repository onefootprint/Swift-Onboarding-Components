import { useToggle, useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { RoleScope } from '@onefootprint/types';
import { Box, Button, Typography } from '@onefootprint/ui';
import React from 'react';
import PermissionGate from 'src/components/permission-gate';
import styled from 'styled-components';

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
      <Header>
        <Box>
          <Typography variant="label-1" as="h3" sx={{ marginBottom: 2 }}>
            {t('header.title')}
          </Typography>
          <Typography variant="body-3">{t('header.subtitle')}</Typography>
        </Box>
        <PermissionGate
          fallbackText={t('header.cta-not-allowed')}
          scope={RoleScope.onboardingConfiguration}
        >
          <Button onClick={openCreateDialog} variant="secondary" size="small">
            {t('header.cta')}
          </Button>
        </PermissionGate>
      </Header>
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

const Header = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

export default OnboardingConfigs;
