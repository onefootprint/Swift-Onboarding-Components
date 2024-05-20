import { Container, Grid, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SectionTitle from '../../components/section-title';
import Backtest from './cards/backtest';
import BuildRules from './cards/build-rules';
import DeviceInsights from './cards/device-insights';
import VerifyUsers from './cards/verify-users';

const Verify = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify',
  });

  return (
    <VerifyContainer justify="center" direction="column">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} />
      <GridContainer>
        <BuildRules />
        <VerifyUsers />
        <DeviceInsights />
        <Backtest />
      </GridContainer>
    </VerifyContainer>
  );
};

const GridContainer = styled(Grid.Container)`
  ${({ theme }) => css`
    gap: ${theme.spacing[5]};
    grid-template-columns: repeat(1, 1fr);
    grid-template-rows: repeat(4, auto);

    ${media.greaterThan('md')`
      gap: ${theme.spacing[7]};
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 420px);
      padding: ${theme.spacing[9]};
      background-color: ${theme.backgroundColor.secondary};
      border-radius: ${theme.borderRadius.xl};
      overflow: hidden;
      width: 100%;
    `}
  `}
`;

const VerifyContainer = styled(Container)`
  ${({ theme }) => css`
    max-width: 100%;
    gap: ${theme.spacing[9]};
    padding: ${theme.spacing[9]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[11]} 0;
    `}
  `}
`;

export default Verify;
