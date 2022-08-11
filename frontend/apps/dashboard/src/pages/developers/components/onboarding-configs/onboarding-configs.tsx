import { useToggle, useTranslation } from 'hooks';
import React from 'react';
import styled, { css } from 'styled-components';
import { Box, Button, Divider, Typography } from 'ui';

import CreateDialog from './components/create-dialog';
import List from './components/list';

const OnboardingConfigurations = () => {
  const [isCreateDialogOpen, openCreateDialog, closeCreateDialog] =
    useToggle(false);
  const { t } = useTranslation('pages.developers.onboarding-configs');

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
      <StyledDivider />
      <List />
      <CreateDialog open={isCreateDialogOpen} onClose={closeCreateDialog} />
    </section>
  );
};

const Header = styled.header`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin: ${theme.spacing[7]}px 0;
  `}
`;

export default OnboardingConfigurations;
