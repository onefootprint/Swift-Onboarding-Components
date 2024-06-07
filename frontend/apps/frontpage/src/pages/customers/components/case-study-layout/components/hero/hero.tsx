import { Stack, Text, media } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';

import type { CompanyDetailsProps } from '../../case-study-layout';
import Breadcrumb from './components/breadcrumb';

const Hero = ({ name, title, subtitle, href }: CompanyDetailsProps) => {
  const currentRoute = useRouter().asPath;
  return (
    <Section>
      <InnerContainer direction="column" gap={3}>
        <Breadcrumb
          activeRoute={currentRoute}
          items={[
            { label: 'Home', href: '/' },
            { label: `${name}'s case study`, href: currentRoute },
          ]}
        />
        <TextContent direction="column" gap={5} width="100%">
          <Text variant="display-2" tag="h1">
            {title}
          </Text>
          <Text variant="display-4" tag="h2">
            {subtitle}
          </Text>
          {href && <Link href={href}>{name}</Link>}
        </TextContent>
      </InnerContainer>
    </Section>
  );
};

const Section = styled(Stack)`
  ${({ theme }) => css`
    position: relative;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[5]} ${theme.spacing[5]} ${theme.spacing[10]}
      ${theme.spacing[5]};
    background: linear-gradient(
      0deg,
      ${theme.backgroundColor.secondary} 0%,
      transparent 100%
    );

    ${media.greaterThan('md')`
      padding: 0 0 ${theme.spacing[10]} 0;
    `}
  `}
`;

const InnerContainer = styled(Stack)`
  ${({ theme }) => css`
    width: 100%;
    max-width: calc(var(--center-max-width) + ${theme.spacing[9]} + 320px);
    margin: 0 auto;
  `}
`;

const TextContent = styled(Stack)`
  max-width: 800px;

  h1,
  h2 {
    margin: 0;
  }
`;

export default Hero;
