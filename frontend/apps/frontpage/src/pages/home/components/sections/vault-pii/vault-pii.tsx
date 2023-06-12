import { useTranslation } from '@onefootprint/hooks';
import {
  IcoCreditcard16,
  IcoFileText16,
  IcoUserCircle16,
} from '@onefootprint/icons';
import { Container, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import SectionTitle from '../../section-title/section-title';
import CircularBeam from './components/circular-beam/circular-beam';
import HorizontalCard from './components/horizontal-card';
import CustomDataIllustration from './components/illustrations/custom-data/custom-data';
import IdDataIllustration from './components/illustrations/id-data-illustration';
import PaymentCardData from './components/illustrations/payment-card-data/payment-card-data';
import VerticalCard from './components/vertical-card';

const VaultPii = () => {
  const { t } = useTranslation('pages.home.vault-pii');
  return (
    <Section>
      <SectionTitle
        title={t('title')}
        subtitle={t('subtitle')}
        cta={t('cta')}
        icon="/home/icons/layers.png"
        darkTheme
      />
      <Grid>
        <HorizontalCard
          gridArea="top"
          title={t('identity-data.title')}
          subtitle={t('identity-data.subtitle')}
          icon={IcoUserCircle16}
        >
          <IdDataIllustration />
        </HorizontalCard>
        <VerticalCard
          gridArea="bottom-1"
          title={t('card-data.title')}
          subtitle={t('card-data.subtitle')}
          iconComponent={IcoCreditcard16}
          hideFadeOutMask
        >
          <PaymentCardData />
        </VerticalCard>
        <VerticalCard
          gridArea="bottom-2"
          title={t('custom-data.title')}
          subtitle={t('custom-data.subtitle')}
          iconComponent={IcoFileText16}
        >
          <CustomDataIllustration />
        </VerticalCard>
        <Outer speed={10} delay={0} diameter={1300} />
        <Center speed={5} delay={1} diameter={1100} />
        <Inner speed={5} delay={3} diameter={800} />
      </Grid>
    </Section>
  );
};

const Section = styled.section`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.tertiary};
    color: ${theme.color.quinary};
    padding: ${theme.spacing[12]} 0;
    position: relative;
  `}
`;

const Grid = styled(Container)`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[10]};
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: fit-content;
    gap: ${theme.spacing[5]};
    isolation: isolate;
    grid-template-areas:
      'top'
      'bottom-1'
      'bottom-2';
  `}

  ${media.greaterThan('md')`
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'top top'
      'bottom-1 bottom-2';
  `}
`;

const Outer = styled(CircularBeam)`
  position: absolute;
  right: -120px;
  top: -120px;
  z-index: 0;
`;

const Center = styled(CircularBeam)`
  position: absolute;
  right: 0;
  top: 0;
  z-index: 0;
`;

const Inner = styled(CircularBeam)`
  position: absolute;
  right: 120px;
  top: 100px;
  z-index: 0;
`;

export default VaultPii;
