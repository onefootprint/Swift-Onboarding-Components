import { Layout, SecuredByFootprint } from '@onefootprint/footprint-elements';
import React from 'react';
import styled, { css } from 'styled-components';

import useSandboxMode from '../../hooks/use-sandbox-mode';

export const HANDOFF_CONTAINER_ID = 'handoff-container-id';

type LayoutProps = {
  children: React.ReactNode;
};

const HandoffLayout = ({ children }: LayoutProps) => {
  const { isSandbox } = useSandboxMode();

  return (
    <Layout
      isSandbox={isSandbox}
      footer={
        <Footer>
          <SecuredByFootprint />
        </Footer>
      }
    >
      {children}
    </Layout>
  );
};

const Footer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[4]} ${theme.spacing[7]};
    display: flex;
    justify-content: center;
    align-items: center;
  `}
`;

export default HandoffLayout;
