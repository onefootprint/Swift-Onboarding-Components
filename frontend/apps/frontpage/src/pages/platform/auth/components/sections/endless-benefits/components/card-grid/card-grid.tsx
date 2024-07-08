import { Grid, media } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import FeatureCard from 'src/components/feature-card';
import styled, { css } from 'styled-components';

import ChargebackDisputes from './illustrations/chargeback-disputes';
import DeviceInsights from './illustrations/device-insights';
import EasierAccountRecovery from './illustrations/easier-account-recovery';
import EmailAndSmsSupport from './illustrations/email-and-sms-support';
import NoMorePhishing from './illustrations/no-more-phishing';
import SecurityLogs from './illustrations/security-logs';

const cards = [
  {
    id: 1,
    translations: 'no-more-phishing',
    illustration: <NoMorePhishing />,
    invertedGradient: false,
  },
  {
    id: 2,
    translations: 'easier-account-recovery',
    illustration: <EasierAccountRecovery />,
    invertedGradient: false,
  },
  {
    id: 3,
    translations: 'chargeback-disputes',
    illustration: <ChargebackDisputes />,
    invertedGradient: false,
  },
  {
    id: 4,
    translations: 'email-and-sms-support',
    illustration: <EmailAndSmsSupport />,
    invertedGradient: true,
  },
  {
    id: 5,
    translations: 'security-logs',
    illustration: <SecurityLogs />,
    invertedGradient: true,
  },
  {
    id: 6,
    translations: 'device-insights',
    illustration: <DeviceInsights />,
    invertedGradient: true,
  },
];

const CardGrid = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.auth.endless-benefits.elements',
  });
  return (
    <Layout>
      {cards.map(({ translations, illustration, id, invertedGradient }) => (
        <FeatureCard
          size="compact"
          title={t(`${translations}.title` as ParseKeys<'common'>)}
          subtitle={t(`${translations}.subtitle` as ParseKeys<'common'>)}
          $gridArea={translations}
          key={id}
          $invertedGradient={!isMobile ? invertedGradient : id % 2 === 0}
        >
          {illustration}
        </FeatureCard>
      ))}
    </Layout>
  );
};

const Layout = styled(Grid.Container)`
  ${({ theme }) => css`
    max-width: 1280px;
    margin: 0 auto;
    position: relative;
    grid-template-columns: 1fr;
    margin-top: ${theme.spacing[10]};
    grid-template-areas:
      'no-more-phishing'
      'easier-account-recovery'
      'chargeback-disputes'
      'email-and-sms-support'
      'security-logs'
      'device-insights';

    ${media.greaterThan('md')`
      row-gap: ${theme.spacing[3]};
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1fr 1px 1fr;
      grid-template-areas:
        'no-more-phishing easier-account-recovery chargeback-disputes'
        'divider divider divider'
        'email-and-sms-support security-logs device-insights';
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

export default CardGrid;
