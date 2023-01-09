import { SecuredByFootprint } from '@onefootprint/footprint-elements';
import { media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <LayoutContainer>
    <Body>{children}</Body>
    <Footer>
      <SecuredByFootprint />
    </Footer>
  </LayoutContainer>
);

const LayoutContainer = styled.div`
  ${({ theme }) => css`
    background: ${theme.components.bifrost.dialog.bg};
    border-radius: ${theme.components.bifrost.dialog.borderRadius};
    display: flex;
    flex-direction: column;
    height: 100vh;
    margin: 0;
    overflow-y: auto;
    position: relative;

    ${media.greaterThan('md')`
      height: unset;
      margin: ${theme.spacing[9]} auto ${theme.spacing[9]};
      max-width: 480px;
      max-height: calc(100vh - (2 * ${theme.spacing[9]}));
    `}
  `}
`;

const Body = styled.div`
  ${({ theme }) => css`
    flex: 1 0 auto;
    padding: ${theme.spacing[5]};
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[7]} ${theme.spacing[7]};
    `}
  `}
`;

const Footer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[4]} ${theme.spacing[7]};
    display: flex;
    justify-content: center;
    align-items: center;
  `}
`;

export default Layout;
