import { Box, Container, Text, media } from '@onefootprint/ui';
import { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import FeatureCard from './components/feature-card';
import AlloyIllustration from './components/illustrations/alloy-illustration';
import OnfidoIllustration from './components/illustrations/onfido-illustration';
import PersonaIllustration from './components/illustrations/persona-illustration';
import PlaidIllustration from './components/illustrations/plaid-illustration';

type FeatureCardType = {
  company: string;
  illustration: React.ReactNode;
  area: string;
};

const featureCards: FeatureCardType[] = [
  {
    company: 'alloy',
    illustration: <AlloyIllustration />,
    area: 'feature1',
  },
  {
    company: 'plaid',
    illustration: <PlaidIllustration />,
    area: 'feature2',
  },
  {
    company: 'onfido',
    illustration: <OnfidoIllustration />,
    area: 'feature3',
  },
  {
    company: 'persona',
    illustration: <PersonaIllustration />,
    area: 'feature4',
  },
];

const FeatureGrid = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.compare.switching' });
  return (
    <Section direction="column" align="center" justify="center">
      <Text variant="display-2">{t('title')}</Text>
      <StyledContainer>
        {featureCards.map(featureCard => (
          <FeatureCard
            key={featureCard.company}
            illustration={featureCard.illustration}
            tag={t(`${featureCard.company}.company` as ParseKeys<'common'>)}
            title={t(`${featureCard.company}.title` as ParseKeys<'common'>)}
            subtitle={t(`${featureCard.company}.subtitle` as ParseKeys<'common'>)}
            area={featureCard.area}
          />
        ))}
      </StyledContainer>
    </Section>
  );
};

const Section = styled(Container)`
  ${({ theme }) => css`
    gap: ${theme.spacing[7]};
    padding-top: ${theme.spacing[12]};
    padding-bottom: ${theme.spacing[9]};
  `}
`;

const StyledContainer = styled(Box)`
  ${({ theme }) => css`
    width: 100%;
    grid-column-gap: ${theme.spacing[9]};
    grid-row-gap: ${theme.spacing[10]};
    padding-top: ${theme.spacing[9]};
    padding-bottom: ${theme.spacing[10]};
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    grid-template-rows: repeat(4, 1fr);
    max-width: 1100px;
    grid-template-areas:
      'feature1'
      'feature2'
      'feature3'
      'feature4';

    ${media.greaterThan('md')`
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      grid-template-areas:
        'feature1 feature2'
        'feature3 feature4';
    `}
  `}
`;

export default FeatureGrid;
