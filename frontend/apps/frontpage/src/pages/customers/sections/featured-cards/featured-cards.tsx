import { Box, Container, media } from '@onefootprint/ui';
import React from 'react';
import {
  BloomLogo,
  CobaLogo,
  FlexcarLogo,
} from 'src/components/company-logos/themed';
import styled, { css } from 'styled-components';

import Line from '../../components/line';
import FeaturedCard from './components/featured-card';

const featuredCases = [
  {
    company: 'coba',
    logo: CobaLogo,
    title: 'Coba',
    gridArea: 'coba',
    url: '/customers/coba',
  },
  {
    company: 'composer',
    logo: FlexcarLogo,
    title: 'Flexcar',
    gridArea: 'flexcar',
    url: '/customers/flexcar',
  },
  {
    company: 'bloom',
    logo: BloomLogo,
    title: 'Bloom',
    gridArea: 'bloom',
    url: '/customers/bloom',
  },
];

const FeaturedCards = () => (
  <GridContainer>
    <Line variant="horizontal" position={{ top: '0%' }} />
    {featuredCases.map(featuredCase => {
      const isLast =
        featuredCases.indexOf(featuredCase) === featuredCases.length - 1;
      return (
        <Box position="relative" key={featuredCase.company}>
          <FeaturedCard
            logo={featuredCase.logo}
            title={featuredCase.title}
            gridArea={featuredCase.gridArea}
            url={featuredCase.url}
          />
          <Line variant="vertical" position={{ left: '0%' }} />
          {isLast && <Line variant="vertical" position={{ right: '0%' }} />}
        </Box>
      );
    })}
    <Line variant="horizontal" position={{ bottom: '0%' }} />
  </GridContainer>
);

const GridContainer = styled(Container)`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    flex-direction: column;
    margin: ${theme.spacing[11]} auto;

    ${media.greaterThan('md')`
      display: grid;
      height: 280px;
      grid-template-columns: repeat(3, 1fr);
      grid-template-areas: 'findigs flexcar bloom';
    `}
  `}
`;
export default FeaturedCards;
