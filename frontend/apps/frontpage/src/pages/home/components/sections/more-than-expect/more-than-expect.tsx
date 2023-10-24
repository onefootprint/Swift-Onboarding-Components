import { useTranslation } from '@onefootprint/hooks';
import { IcoHeart24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Grid, media } from '@onefootprint/ui';
import React from 'react';

import FeatureCard from '../../feature-card';
import SectionTitle from '../../section-title';
import AppClip from './illustrations/appclip';
import Auth from './illustrations/auth';
import FraudRisk from './illustrations/fraud-risk';
import IdScans from './illustrations/id-scans';
import ManualReview from './illustrations/manual-review';
import SecurityLogs from './illustrations/security-logs';

const MoreThanExpect = () => {
  const { t } = useTranslation('pages.home.more-than-expect');
  return (
    <>
      <SectionTitle
        title={t('title')}
        subtitle={t('subtitle')}
        icon={IcoHeart24}
      />
      <Layout columns={['1fr']} rows={['420px']} marginTop={10}>
        <FeatureCard
          size="compact"
          title={t('appclip.title')}
          subtitle={t('appclip.subtitle')}
          gridArea="app-clip"
        >
          <AppClip />
        </FeatureCard>
        <FeatureCard
          size="compact"
          title={t('fraud-risk.title')}
          subtitle={t('fraud-risk.subtitle')}
          gridArea="fraud-risk"
        >
          <FraudRisk />
        </FeatureCard>
        <FeatureCard
          size="compact"
          title={t('security-logs.title')}
          subtitle={t('security-logs.subtitle')}
          gridArea="security-logs"
        >
          <SecurityLogs />
        </FeatureCard>
        <FeatureCard
          size="compact"
          title={t('id-scan.title')}
          subtitle={t('id-scan.subtitle')}
          gridArea="id-scans"
        >
          <IdScans />
        </FeatureCard>
        <FeatureCard
          size="compact"
          title={t('auth.title')}
          subtitle={t('auth.subtitle')}
          gridArea="auth"
        >
          <Auth />
        </FeatureCard>
        <FeatureCard
          size="compact"
          title={t('manual-review.title')}
          subtitle={t('manual-review.subtitle')}
          gridArea="manual-review"
        >
          <ManualReview />
        </FeatureCard>
        <Divider gridArea="divider" />
      </Layout>
    </>
  );
};

const Divider = styled.div<{ gridArea: string }>`
  ${({ theme, gridArea }) => css`
    grid-area: ${gridArea};
    background: radial-gradient(
      50% 50% at 50% 50%,
      ${theme.borderColor.tertiary} 0%,
      ${theme.borderColor.transparent} 100%
    );
  `}
`;

const Layout = styled(Grid.Container)`
  ${({ theme }) => css`
    position: relative;
    grid-template-areas:
      'app-clip'
      'fraud-risk'
      'security-logs'
      'id-scans'
      'auth'
      'manual-review';

    ${media.greaterThan('sm')`
      row-gap: ${theme.spacing[3]};
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1fr 1px 1fr;
      grid-template-areas:
        'app-clip fraud-risk security-logs'
        'divider divider divider'
        'id-scans auth manual-review';
    `}

    &:before {
      content: '';
      position: absolute;
      top: calc(-1 * ${theme.borderWidth[1]});
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      height: ${theme.borderWidth[1]};
      background: radial-gradient(
        circle,
        ${theme.borderColor.tertiary} 0%,
        ${theme.borderColor.tertiary} 50%,
        transparent 100%
      );
    }

    &:after {
      content: '';
      position: absolute;
      bottom: calc(-1 * ${theme.borderWidth[1]});
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      height: ${theme.borderWidth[1]};
      background: radial-gradient(
        circle,
        ${theme.borderColor.tertiary} 0%,
        ${theme.borderColor.tertiary} 50%,
        transparent 100%
      );
    }
  `}
`;

export default MoreThanExpect;
