import { Grid, Stack, media } from '@onefootprint/ui';
import type React from 'react';
import styled, { css } from 'styled-components';

import Hero from './components/hero';
import SummaryCard from './components/summary-card';

export type CompanyDetailsProps = {
  name: string;
  logo?: string;
  industry?: string;
  website?: string;
  customerSince?: string;
  title?: string;
  subtitle?: string;
  href?: string;
};

type CaseStudyLayoutProps = {
  children: React.ReactNode;
  companyDetails: CompanyDetailsProps;
};

const CaseStudyLayout = ({ children, companyDetails }: CaseStudyLayoutProps) => (
  <Container>
    <Hero
      name={companyDetails.name}
      logo={companyDetails.logo}
      industry={companyDetails.industry}
      title={companyDetails.title}
      subtitle={companyDetails.subtitle}
      customerSince={companyDetails.customerSince}
      href={companyDetails.href}
    />
    <ArticleContainer>
      <Main direction="column">{children}</Main>
      <SummaryRail height="100%" position="relative">
        <SummaryCard
          name={companyDetails.name}
          logo={companyDetails.logo}
          industry={companyDetails.industry}
          customerSince={companyDetails.customerSince}
          website={companyDetails.website}
        />
      </SummaryRail>
    </ArticleContainer>
  </Container>
);

const ArticleContainer = styled(Grid.Container)`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]} ${theme.spacing[5]} ${theme.spacing[10]}
      ${theme.spacing[5]};
    display: flex;
    flex-direction: column;
    margin-top: ${theme.spacing[9]};

    ${media.greaterThan('md')`
      display: grid;
      grid-template-columns: minmax(auto, var(--center-max-width)) 320px;
      margin: 0 auto;
      grid-template-areas: 'main summary';
      grid-column-gap: ${theme.spacing[9]};
      grid-row-gap: ${theme.spacing[7]};
      padding: ${theme.spacing[9]} 0 ${theme.spacing[11]} 0;
      max-width: none;
    `};
  `}
`;

const Container = styled(Stack)`
  ${({ theme }) => css`
    --center-max-width: 680px;
    display: flex;
    flex-direction: column;

    ul {
      margin: 0;
      padding: 0;
      margin-bottom: ${theme.spacing[5]};
    }

    li {
      list-style-type: none;
      background-image: url('/bullet-dot.svg');
      background-size: ${theme.spacing[2]} ${theme.spacing[2]};
      background-repeat: no-repeat;
      background-position: calc(${theme.spacing[3]} + 2px)
        calc(${theme.spacing[3]} + 1px);
      padding-left: ${theme.spacing[8]};
      margin-bottom: ${theme.spacing[3]};
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin-top: 0;
      margin-bottom: ${theme.spacing[7]};
    }

    p {
      margin-bottom: ${theme.spacing[8]};
    }
  `}
`;

const Main = styled(Grid.Item)`
  grid-area: main;
  display: flex;
  flex-direction: column;
`;

const SummaryRail = styled(Grid.Item)`
  grid-area: summary;
  display: none;

  ${media.greaterThan('md')`
    display: block;
  `}
`;

export default CaseStudyLayout;
