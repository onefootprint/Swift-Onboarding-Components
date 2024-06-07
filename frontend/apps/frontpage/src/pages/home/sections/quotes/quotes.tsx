import { Container, Grid, media } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SectionTitle from '../../../../components/desktop-share-post/section-title';
import QuoteCard from './components/quote-card';

export type Companies = 'apiture' | 'flexcar' | 'bloom' | 'findigs' | 'coba';

const Quotes = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.quotes',
  });
  return (
    <QuotesContainer align="center" justify="center" direction="column">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} align="center" />
      <GridContainer>
        <Column>
          <QuoteCard company="apiture" />
          <QuoteCard company="coba" />
        </Column>
        <Column>
          <QuoteCard company="bloom" />
          <QuoteCard company="findigs" />
          <QuoteCard company="flexcar" />
        </Column>
      </GridContainer>
    </QuotesContainer>
  );
};

const QuotesContainer = styled(Container)`
  ${({ theme }) => css`
    gap: ${theme.spacing[9]};
    overflow: hidden;
    padding: ${theme.spacing[9]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[11]} 0;
    `}
  `}
`;

const Column = styled(Grid.Item)`
  ${({ theme }) => css`
    position: relative;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

const GridContainer = styled(Grid.Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};

    ${media.greaterThan('md')`
      display: grid;
      max-width: 100%;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    `}
  `}
`;

export default Quotes;
