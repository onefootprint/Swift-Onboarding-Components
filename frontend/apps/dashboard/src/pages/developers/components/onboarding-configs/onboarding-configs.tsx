import { useToggle, useTranslation } from '@onefootprint/hooks';
import React from 'react';
import { getErrorMessage } from 'request';
import styled from 'styled-components';
import { Box, Button, Divider, Typography } from 'ui';

import CreateDialog from './components/create-onboarding-config';
import OnboardingConfigsData from './components/onboarding-configs-data';
import OnboardingConfigsError from './components/onboarding-configs-error';
import OnboardingConfigsLoading from './components/onboarding-configs-loading';
import useOnboardingConfigs from './hooks/use-onboarding-configs';

const OnboardingConfigs = () => {
  const [isCreateDialogOpen, openCreateDialog, closeCreateDialog] =
    useToggle(false);
  const { t } = useTranslation('pages.developers.onboarding-configs');
  const { data, error, isLoading } = useOnboardingConfigs();

  return (
    <section data-testid="onboarding-configs-section">
      <Header>
        <Box>
          <Typography variant="label-1" as="h3" sx={{ marginBottom: 2 }}>
            {t('header.title')}
          </Typography>
          <Typography variant="body-3">{t('header.subtitle')}</Typography>
        </Box>
        <Button onClick={openCreateDialog} variant="secondary" size="small">
          {t('header.cta')}
        </Button>
      </Header>
      <Box sx={{ marginY: 7 }}>
        <Divider />
      </Box>
      {data && <OnboardingConfigsData data={data} />}
      {isLoading && <OnboardingConfigsLoading />}
      {error && <OnboardingConfigsError message={getErrorMessage(error)} />}
      <CreateDialog open={isCreateDialogOpen} onClose={closeCreateDialog} />
    </section>
  );
};

const Header = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

export default OnboardingConfigs;
