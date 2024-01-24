import {
  IcoChartUp16,
  IcoCode16,
  IcoFaceid16,
  IcoIdCard24,
  IcoSparkles16,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Container, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import FeatureCard from '../../../../../components/feature-card/feature-card';
import MicroFeatureCard from '../../micro-feature-card/micro-feature-card';
import SectionTitle from '../../section-title';
import KybIllustration from './components/illustrations/kyb-illustration';
import KycIllustration from './components/illustrations/kyc-illustration';

const NewApproach = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.new-approach',
  });
  return (
    <>
      <SectionTitle
        title={t('title')}
        subtitle={t('subtitle')}
        icon={IcoIdCard24}
      />
      <Grid>
        <FeatureCard
          title={t('kyc.title')}
          subtitle={t('kyc.subtitle')}
          gridArea="top-left"
          cta={t('kyc.cta')}
          href={t('kyc.href')}
        >
          <KycIllustration />
        </FeatureCard>
        <FeatureCard
          title={t('kyb.title')}
          subtitle={t('kyb.subtitle')}
          gridArea="top-right"
          cta={t('kyb.cta')}
          href={t('kyb.href')}
        >
          <KybIllustration />
        </FeatureCard>
        <MicroFeatureCard
          title={t('passkeys.title')}
          subtitle={t('passkeys.subtitle')}
          gridArea="bottom-1"
          icon={IcoFaceid16}
        />
        <MicroFeatureCard
          title={t('increased-conversion.title')}
          subtitle={t('increased-conversion.subtitle')}
          gridArea="bottom-2"
          icon={IcoChartUp16}
        />
        <MicroFeatureCard
          title={t('dev-experience.title')}
          subtitle={t('dev-experience.subtitle')}
          gridArea="bottom-3"
          icon={IcoCode16}
        />
        <MicroFeatureCard
          title={t('last-pixel.title')}
          subtitle={t('last-pixel.subtitle')}
          gridArea="bottom-4"
          icon={IcoSparkles16}
        />
      </Grid>
    </>
  );
};

const Grid = styled(Container)`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 596px 596px auto auto auto auto;
    grid-template-areas:
      'top-left'
      'top-right'
      'bottom-1'
      'bottom-2'
      'bottom-3'
      'bottom-4';
    margin-top: ${theme.spacing[9]};
  `}

  ${media.greaterThan('sm')`
    grid-template-rows: 596px 596px 132px 132px 132px 132px;
  `}

  ${media.greaterThan('md')`
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-template-rows: 596px 1px 180px;
    grid-template-areas:
      'top-left top-left top-right top-right'
      'bottom-1 bottom-2 bottom-3 bottom-4';
  `}
`;

export default NewApproach;
