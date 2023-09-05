import styled, { createGlobalStyle, css } from '@onefootprint/styled';
import { media } from '@onefootprint/ui';
import React from 'react';

import SubscribeToNewsletter from './components/subscribe-to-newsletter';

export type WrittingLayoutProps = {
  children: React.ReactNode;
};

const WrittingLayout = ({ children }: WrittingLayoutProps) => (
  <>
    <GlobalStyle />
    <WrittingLayoutContainer>
      {children}
      <SubscribeToNewsletter />
    </WrittingLayoutContainer>
  </>
);

const GlobalStyle = createGlobalStyle`
  ${({ theme }) => css`
    :root {
      --desktop-spacing: ${theme.spacing[5]};
      --mobile-spacing: ${theme.spacing[0]};
    }
  `}
`;

const WrittingLayoutContainer = styled.div`
  ${({ theme }) => css`
    margin: 0 auto;
    max-width: 960px;
    padding: ${theme.spacing[11]} 0 0 0;

    ${media.greaterThan('sm')`
      padding: 0 ${theme.spacing[11]};  
    `}

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[10]};
    `}
  `}
`;

export default WrittingLayout;
