import {
  IcoCode16,
  IcoFileText16,
  IcoUsers16,
  LogoFpCompact,
} from '@onefootprint/icons';
import { Container, Tab, Tabs, Typography } from '@onefootprint/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import useSessionUser from 'src/hooks/use-session-user';
import styled, { css } from 'styled-components';

import NavDropdown from './components/nav-dropdown';
import SandboxBanner from './components/sandbox-banner';

const routes = [
  { href: '/users', Icon: IcoUsers16, text: 'Users' },
  { href: '/security-logs', Icon: IcoFileText16, text: 'Security logs' },
  { href: '/developers', Icon: IcoCode16, text: 'Developers' },
];

type PrivateLayoutProps = {
  children: React.ReactNode;
};

const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const router = useRouter();
  const { data } = useSessionUser();

  return (
    <>
      <PrivateLayoutContainer data-testid="private-layout">
        <header>
          <SandboxBanner />
          <Container>
            <Footprint>
              <Link href="/users">
                <a href="/users">
                  <LogoFpCompact />
                </a>
              </Link>
              <NavDropdown />
            </Footprint>
          </Container>
          <Nav>
            <Container>
              <Tabs variant="pill">
                {routes.map(({ href, Icon, text }) => (
                  <Tab
                    href={href}
                    selected={router.pathname.startsWith(href)}
                    as={Link}
                  >
                    <Icon />
                    {text}
                  </Tab>
                ))}
              </Tabs>
            </Container>
          </Nav>
        </header>
        <section>
          <Container>{children}</Container>
        </section>
      </PrivateLayoutContainer>
      <Footer>
        <Typography
          color="tertiary"
          variant="label-4"
          sx={{ marginTop: 7, textAlign: 'center' }}
        >
          Footprint ❤️ {data?.tenantName}
        </Typography>
      </Footer>
    </>
  );
};

const PrivateLayoutContainer = styled.div`
  flex: 1 0 auto;
`;

const Footprint = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  ${({ theme }) => css`
    padding: ${theme.spacing[4]}px 0;
  `};
`;

const Nav = styled.nav`
  ${({ theme }) => css`
    border-top: 1px solid ${theme.borderColor.tertiary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.secondary};
    padding: ${theme.spacing[3]}px 0;
    margin-bottom: ${theme.spacing[7]}px;
  `};
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    margin: ${theme.spacing[5]}px 0;
  `};
`;

export default PrivateLayout;
