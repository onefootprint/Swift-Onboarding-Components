import IcoFileText16 from 'icons/ico/ico-file-text-16';
import IcoUser24 from 'icons/ico/ico-user-24';
import IcoUsers16 from 'icons/ico/ico-users-16';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';
import { Box, Container, FootprintLogo, IconButton, Tab, Typography } from 'ui';

import useSessionUser from '../../../../hooks/use-session-user';

const routes = [
  { href: '/users', Icon: IcoUsers16, text: 'Users' },
  { href: '/security-logs', Icon: IcoFileText16, text: 'Security logs' },
];

type PrivateLayoutProps = {
  children: React.ReactNode;
};

const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const router = useRouter();
  const { data, isLive, logOut } = useSessionUser();
  return (
    <div data-testid="private-layout">
      <header>
        {!isLive && (
          <Box sx={{ backgroundColor: 'warning' }}>
            <Typography
              variant="body-3"
              sx={{ textAlign: 'center', paddingY: 2 }}
            >
              You are in sandbox mode.
            </Typography>
          </Box>
        )}
        <Container minSize="md">
          <Footprint>
            <Link href="/users">
              <a href="/users">
                <FootprintLogo />
              </a>
            </Link>
            <SuffixContainer>
              <IconButton
                iconComponent={IcoUser24}
                onClick={logOut}
                aria-label="account"
              />
            </SuffixContainer>
          </Footprint>
        </Container>
        <Nav>
          <Container minSize="md">
            <Tab.List>
              {routes.map(({ href, Icon, text }) => (
                <Link href={href} key={text}>
                  <Tab.Item
                    href={href}
                    iconComponent={Icon}
                    selected={router.pathname.startsWith(href)}
                  >
                    {text}
                  </Tab.Item>
                </Link>
              ))}
            </Tab.List>
          </Container>
        </Nav>
      </header>
      <section>
        <Container minSize="md">{children}</Container>
      </section>
      <section>
        <FooterContainer>
          <Typography variant="caption-2" color="tertiary">
            We ❤️ {data?.tenantName}
          </Typography>
        </FooterContainer>
      </section>
    </div>
  );
};

const Footprint = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  ${({ theme }) => css`
    padding: ${theme.spacing[4]}px 0;
  `};
`;

const SuffixContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: center;
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

const FooterContainer = styled.div`
  ${({ theme }) => css`
    text-align: center;
    padding: ${theme.spacing[3]}px 0;
    margin: ${theme.spacing[12]}px;
  `};
`;

export default PrivateLayout;
