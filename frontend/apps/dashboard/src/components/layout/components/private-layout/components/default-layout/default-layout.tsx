import { useTranslation } from '@onefootprint/hooks';
import {
  IcoCode16,
  IcoFileText16,
  IcoSettings16,
  IcoStore16,
  IcoUsers16,
  LogoFpCompact,
} from '@onefootprint/icons';
import { Container, Tab, Tabs, Typography } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import useOrgSession from 'src/hooks/use-org-session';
import styled, { css } from 'styled-components';

import AssumeBanner from './components/assume-banner';
import NavDropdown from './components/nav-dropdown';
import SandboxBanner from './components/sandbox-banner';

type DefaultLayoutProps = {
  children: React.ReactNode;
};

const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  const { t } = useTranslation('components.private-layout.nav');
  const router = useRouter();
  const {
    data,
    sandbox: { isSandbox },
  } = useOrgSession();

  const routes = [
    { href: '/users', Icon: IcoUsers16, text: t('users') },
    { href: '/security-logs', Icon: IcoFileText16, text: t('security-logs') },
    { href: '/developers', Icon: IcoCode16, text: t('developers') },
    { href: '/settings', Icon: IcoSettings16, text: t('settings') },
  ];

  // TODO:
  // https://linear.app/footprint/issue/FP-3469/remove-business-condition
  if (isSandbox) {
    const business = {
      href: '/businesses',
      Icon: IcoStore16,
      text: t('businesses'),
    };
    routes.splice(1, 0, business);
  }

  return (
    <DefaultLayoutContainer
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
    >
      <Header data-testid="private-default-layout">
        <AssumeBanner />
        <SandboxBanner />
        <Container>
          <Footprint>
            <Link href="/users" aria-label={t('users')}>
              <i>
                <LogoFpCompact />
              </i>
            </Link>
            <NavDropdown />
          </Footprint>
        </Container>
        <Nav>
          <Container>
            <Tabs variant="pill">
              {routes.map(({ href, Icon, text }) => (
                <Tab
                  as={Link}
                  href={href}
                  key={href}
                  selected={router.pathname.startsWith(href)}
                >
                  <>
                    <Icon />
                    {text}
                  </>
                </Tab>
              ))}
            </Tabs>
          </Container>
        </Nav>
        <Container>{children}</Container>
      </Header>
      <Footer>
        {data?.name && (
          <Typography color="tertiary" variant="label-4">
            Footprint ❤️ {data.name}
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

const Footprint = styled.div`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    align-items: center;
    padding: ${theme.spacing[4]} 0;
  `};
`;

const Nav = styled.div`
  ${({ theme }) => css`
    border-top: 1px solid ${theme.borderColor.tertiary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.secondary};
    padding: ${theme.spacing[3]} 0;
    margin-bottom: ${theme.spacing[7]};
  `};
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
