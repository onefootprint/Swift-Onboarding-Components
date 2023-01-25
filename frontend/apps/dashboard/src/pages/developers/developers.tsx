import { useTranslation } from '@onefootprint/hooks';
import { Box, Toggle, Tooltip, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';
import useOrgSession from 'src/hooks/use-org-session';
import styled, { css } from 'styled-components';

import ApiKeys from './components/api-keys';
import OnboardingConfigs from './components/onboarding-configs';

const Developers = () => {
  const { t } = useTranslation('pages.developers');
  const { sandbox } = useOrgSession();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Header>
        <Box>
          <Typography variant="heading-3" as="h2" sx={{ marginBottom: 2 }}>
            {t('header.title')}
          </Typography>
          <Typography
            variant="body-2"
            color={sandbox.isSandbox ? 'warning' : 'success'}
          >
            {sandbox.isSandbox
              ? t('header.subtitle.sandbox')
              : t('header.subtitle.live')}
          </Typography>
        </Box>
        <ToggleContainer>
          <Tooltip
            disabled={sandbox.canToggle}
            size="compact"
            text={t('header.toggle-sandbox.tooltip')}
          >
            <Box>
              <Toggle
                checked={sandbox.isSandbox}
                disabled={!sandbox.canToggle}
                label={t('header.toggle-sandbox.label')}
                onChange={sandbox.toggle}
              />
            </Box>
          </Tooltip>
        </ToggleContainer>
      </Header>
      <Box sx={{ marginBottom: 9 }}>
        <ApiKeys />
      </Box>
      <Box sx={{ marginBottom: 9 }} />
      <Box>
        <OnboardingConfigs />
      </Box>
    </>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[9]};
  `};
`;

const ToggleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]};
  `};
`;

export default Developers;
