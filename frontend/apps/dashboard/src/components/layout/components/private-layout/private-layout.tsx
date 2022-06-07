import IcoCode16 from 'icons/ico/ico-code-16';
import IcoFileText16 from 'icons/ico/ico-file-text-16';
import IcoFootprint24 from 'icons/ico/ico-footprint-24';
import IcoSettings16 from 'icons/ico/ico-settings-16';
import IcoUser24 from 'icons/ico/ico-user-24';
import IcoUsers16 from 'icons/ico/ico-users-16';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';
import { Container, IconButton, Tab, Typography } from 'ui';

import useSessionUser from '../../../../hooks/use-session-user';

const routes = [
  { href: '/users', Icon: IcoUsers16, text: 'Users' },
  { href: '/security-logs', Icon: IcoFileText16, text: 'Security Logs' },
  { href: '/developers', Icon: IcoCode16, text: 'Developers' },
  { href: '/settings', Icon: IcoSettings16, text: 'Settings' },
];

type PrivateLayoutProps = {
  children: React.ReactNode;
};

const PrivateLayout = ({ children }: PrivateLayoutProps) => {
  const router = useRouter();
  const { logOut } = useSessionUser();
  return (
    <div data-testid="private-layout">
      <header>
        <Container>
          <Footprint>
            <FootprintLogoContainer>
              <IcoFootprint24 />
            </FootprintLogoContainer>
            <Typography variant="display-4">Footprint</Typography>
            <SuffixContainer>
              <IconButton
                iconComponent={IcoUser24}
                onClick={logOut}
                ariaLabel="account"
              />
            </SuffixContainer>
          </Footprint>
        </Container>
        <Nav>
          <Container>
            <Tab.List>
              {routes.map(({ href, Icon, text }) => (
                <Link href={href} key={text}>
                  <Tab.Item
                    href={href}
                    iconComponent={Icon}
                    selected={router.pathname === href}
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
        <Container>{children}</Container>
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

const FootprintLogoContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
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

export default PrivateLayout;
