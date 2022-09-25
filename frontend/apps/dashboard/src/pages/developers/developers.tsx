import { useTranslation } from '@onefootprint/hooks';
import Head from 'next/head';
import React from 'react';
import useSandboxMode from 'src/hooks/use-sandbox-mode';
import styled, { css } from 'styled-components';
import { Box, Toggle, Tooltip, Typography } from 'ui';

import ApiKeys from './components/api-keys';
import OnboardingConfigs from './components/onboarding-configs';

const Developers = () => {
  const { t } = useTranslation('pages.developers');
  const sandboxMode = useSandboxMode();

  return (
    <>
      <Head>
        <title>{t('page-title')}</title>
      </Head>
      <Header>
        <Box>
          <Typography variant="heading-2" as="h2" sx={{ marginBottom: 2 }}>
            {t('header.title')}
          </Typography>
          <Typography
            variant="body-2"
            color={sandboxMode.isSandbox ? 'warning' : 'success'}
          >
            {sandboxMode.isSandbox
              ? t('header.subtitle.sandbox')
              : t('header.subtitle.live')}
          </Typography>
        </Box>
        <ToggleContainer>
          <Tooltip
            disabled={sandboxMode.canToggle}
            size="compact"
            text={t('header.toggle-sandbox.tooltip')}
          >
            <Box>
              <Toggle
                aria-label={t('header.toggle-sandbox.label')}
                checked={sandboxMode.isSandbox}
                disabled={!sandboxMode.canToggle}
                label={t('header.toggle-sandbox.label')}
                onChange={sandboxMode.toggle}
              />
            </Box>
          </Tooltip>
        </ToggleContainer>
      </Header>
      <Box sx={{ marginBottom: 9 }}>
        <ApiKeys />
      </Box>
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
    margin-bottom: ${theme.spacing[9]}px;
  `};
`;

const ToggleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]}px;
  `};
`;

export default Developers;
