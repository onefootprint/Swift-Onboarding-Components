import { media } from '@onefootprint/ui';
import type React from 'react';
import styled, { css } from 'styled-components';

import SubscribeToNewsletter from './components/subscribe-to-newsletter';

export type WrittingLayoutProps = {
  children: React.ReactNode;
};

const WrittingLayout = ({ children }: WrittingLayoutProps) => (
  <WrittingLayoutContainer>
    {children}
    <SubscribeToNewsletter />
  </WrittingLayoutContainer>
);

const WrittingLayoutContainer = styled.div`
  ${({ theme }) => css`
    margin: calc(-1 * ${theme.spacing[6]}) auto 0 auto;
    max-width: 960px;

    ${media.greaterThan('sm')`
      margin: 0 auto;
      padding: 0 ${theme.spacing[11]};  
    `}

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[10]};
    `}
  `}
`;

export default WrittingLayout;
