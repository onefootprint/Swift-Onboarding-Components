import styled, { css } from '@onefootprint/styled';
import { Container, Typography } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import useOrgSession from 'src/hooks/use-org-session';

import AssumeBanner from './components/assume-banner';
import Nav from './components/nav';
import SandboxBanner from './components/sandbox-banner';
import TopMenuBar from './components/top-menu-bar';

type DefaultLayoutProps = {
  children: React.ReactNode;
};

const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  const { data: sessionData } = useOrgSession();

  return (
    <DefaultLayoutContainer
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <Header data-testid="private-default-layout">
        <AssumeBanner />
        <SandboxBanner />
        <TopMenuBar />
        <Nav />
        <Container>{children}</Container>
      </Header>
      <Footer>
        {sessionData?.name && (
          <Typography color="tertiary" variant="label-4">
            Footprint ❤️ {sessionData.name}
          </Typography>
        )}
      </Footer>
    </DefaultLayoutContainer>
  );
};

const DefaultLayoutContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.div`
  flex: 1 0 auto;
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;

    p {
      margin: ${theme.spacing[7]} 0 ${theme.spacing[5]};
    }
  `};
`;

export default DefaultLayout;
