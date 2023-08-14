import { useTranslation } from '@onefootprint/hooks';
import {
  IcoCode16,
  IcoFileText16,
  IcoSettings16,
  IcoStore16,
  IcoUsers16,
  ThemedLogoFpCompact,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Box,
  Container,
  Tab,
  Tabs,
  Toggle,
  Tooltip,
  Typography,
} from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import useOrgSession from 'src/hooks/use-org-session';

import AssumeBanner from './components/assume-banner';
import ManualReviewNavigator from './components/manual-review-navigator';
import NavDropdown from './components/nav-dropdown';
import SandboxBanner from './components/sandbox-banner';

type DefaultLayoutProps = {
  children: React.ReactNode;
};

const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  const { t } = useTranslation('components.private-layout.nav');
  const router = useRouter();
  const { data, sandbox } = useOrgSession();

  const routes = [
    { href: '/users', Icon: IcoUsers16, text: t('users') },
    { href: '/businesses', Icon: IcoStore16, text: t('businesses') },
    { href: '/security-logs', Icon: IcoFileText16, text: t('security-logs') },
    { href: '/developers', Icon: IcoCode16, text: t('developers') },
    { href: '/settings', Icon: IcoSettings16, text: t('settings') },
  ];

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
                <ThemedLogoFpCompact color="primary" />
              </i>
            </Link>
            <NavDropdown />
          </Footprint>
        </Container>
        <Nav>
          <Container
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'row',
            }}
          >
            <Tabs variant="pill">
              {routes.map(({ href, Icon, text }) => (
                <Tab
                  key={href}
                  as={Link}
                  href={href}
                  selected={router.pathname.startsWith(href)}
                  icon={Icon}
                >
                  {text}
                </Tab>
              ))}
              <ManualReviewNavigator />
            </Tabs>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Tooltip
                disabled={sandbox.canToggle}
                text={t('sandbox.tooltip')}
                alignment="end"
                position="bottom"
              >
                <Toggle
                  size="compact"
                  checked={sandbox.isSandbox}
                  disabled={!sandbox.canToggle}
                  label={t('sandbox.label')}
                  onChange={sandbox.toggle}
                />
              </Tooltip>
            </Box>
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
