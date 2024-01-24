import { IcoHeart24 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';

import FeatureCard from '../../../../../components/feature-card';
import SectionTitle from '../../section-title';
import AppClip from './illustrations/appclip';
import Auth from './illustrations/auth';
import FraudRisk from './illustrations/fraud-risk';
import IdScans from './illustrations/id-scans';
import ManualReview from './illustrations/manual-review';
import SecurityLogs from './illustrations/security-logs';

const cards = [
  {
    id: 1,
    translations: 'appclip',
    illustration: <AppClip />,
    invertedGradient: false,
  },
  {
    id: 2,
    translations: 'fraud-risk',
    illustration: <FraudRisk />,
    invertedGradient: false,
  },
  {
    id: 3,
    translations: 'security-logs',
    illustration: <SecurityLogs />,
    invertedGradient: false,
  },
  {
    id: 4,
    translations: 'id-scan',
    illustration: <IdScans />,
    invertedGradient: true,
  },
  {
    id: 5,
    translations: 'auth',
    illustration: <Auth />,
    invertedGradient: true,
  },
  {
    id: 6,
    translations: 'manual-review',
    illustration: <ManualReview />,
    invertedGradient: true,
  },
];

const MoreThanExpect = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.more-than-expect',
  });
  return (
    <>
      <SectionTitle
        title={t('title')}
        subtitle={t('subtitle')}
        icon={IcoHeart24}
      />
      <Layout>
        {cards.map(({ translations, illustration, id, invertedGradient }) => (
          <FeatureCard
            size="compact"
            title={t(`${translations}.title` as ParseKeys<'common'>)}
            subtitle={t(`${translations}.subtitle` as ParseKeys<'common'>)}
            gridArea={translations}
            key={id}
            invertedGradient={isMobile ? id % 2 === 0 : invertedGradient}
          >
            {illustration}
          </FeatureCard>
        ))}
      </Layout>
    </>
  );
};

const Layout = styled.div`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    flex-direction: column;
    margin-top: ${theme.spacing[11]};

    ${media.greaterThan('md')`
      display: grid;
      max-width: 1280px;
      margin: ${theme.spacing[11]} auto 0 auto;
      row-gap: ${theme.spacing[3]};
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1fr 1px 1fr;
      grid-template-areas:
        'appclip fraud-risk security-logs'
        'divider divider divider'
        'id-scan auth manual-review';
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
