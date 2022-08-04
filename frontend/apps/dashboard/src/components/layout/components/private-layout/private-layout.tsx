import IcoCode16 from 'icons/ico/ico-code-16';
import IcoFileText16 from 'icons/ico/ico-file-text-16';
import IcoUser24 from 'icons/ico/ico-user-24';
import IcoUsers16 from 'icons/ico/ico-users-16';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import useSandboxMode from 'src/hooks/use-sandbox-mode';
import useSessionUser from 'src/hooks/use-session-user';
import styled, { css } from 'styled-components';
import {
  Banner,
  Container,
  Dropdown,
  FootprintLogo,
  Tab,
  Toggle,
  Typography,
} from 'ui';

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
  const [isSandboxMode, toggleSandboxMode] = useSandboxMode();
  const { data, logOut } = useSessionUser();

  return (
    <>
      <PrivateLayoutContainer data-testid="private-layout">
        <header>
          {isSandboxMode && (
            <SandboxBannerContainer>
              <Banner variant="warning">You are in sandbox mode.</Banner>
            </SandboxBannerContainer>
          )}
          <Container>
            <Footprint>
              <Link href="/users">
                <a href="/users">
                  <FootprintLogo />
                </a>
              </Link>
              <SuffixContainer>
                <Dropdown.Root>
                  <Dropdown.Trigger aria-label="Account">
                    <IcoUser24 />
                  </Dropdown.Trigger>
                  <Dropdown.Portal>
                    <Dropdown.Content align="end">
                      <Dropdown.Item>
                        <Typography variant="label-3">John Doe</Typography>
                        <Typography variant="body-3" color="secondary">
                          {data?.email}
                        </Typography>
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onSelect={logOut}>Log out</Dropdown.Item>
                    </Dropdown.Content>
                  </Dropdown.Portal>
                </Dropdown.Root>
              </SuffixContainer>
            </Footprint>
          </Container>
          <Nav>
            <Container>
              <NavInner>
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
                <ToggleContainer>
                  <Toggle
                    checked={isSandboxMode}
                    id="sandbox-toggle"
                    label="Sandbox mode"
                    onChange={toggleSandboxMode}
                  />
                </ToggleContainer>
              </NavInner>
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

const SandboxBannerContainer = styled.div`
  ${({ theme }) => css`
    border-bottom: 1px solid ${theme.borderColor.tertiary};
  `};
`;

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

const NavInner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const ToggleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    gap: ${theme.spacing[3]}px;
  `};
`;

const Footer = styled.footer`
  ${({ theme }) => css`
    margin: ${theme.spacing[5]}px 0;
  `};
`;

export default PrivateLayout;
