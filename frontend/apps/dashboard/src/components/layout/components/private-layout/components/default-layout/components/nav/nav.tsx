import { useTranslation } from '@onefootprint/hooks';
import {
  IcoBook16,
  IcoCode16,
  IcoFileText16,
  IcoSettings16,
  IcoStore16,
  IcoUsers16,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Box, Container, Tab, Tabs, Toggle, Tooltip } from '@onefootprint/ui';
import { omit } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import useOrgSession from 'src/hooks/use-org-session';

import ManualReviewNavigator from './components/manual-review-navigator';

const Nav = () => {
  const { t } = useTranslation('components.private-layout.nav');
  const router = useRouter();
  const { sandbox } = useOrgSession();

  const userWouldBeRedirected =
    router.pathname.startsWith('/users/[id]') ||
    router.pathname.startsWith('/businesses/[id]');

  const tooltipInfoText = sandbox.isSandbox
    ? t('sandbox-mode.tooltip-info.sandbox')
    : t('sandbox-mode.tooltip-info.live');

  const toggleSandboxMode = () => {
    if (router.pathname.startsWith('/users')) {
      router.push({
        pathname: '/users',
        query: omit(router.query, ['id', 'cursor']),
      });
    } else if (router.pathname.startsWith('/businesses')) {
      router.push({
        pathname: '/businesses',
        query: omit(router.query, ['id', 'cursor']),
      });
    }
    sandbox.toggle();
  };

  const routes = [
    { href: '/users', Icon: IcoUsers16, text: t('users') },
    { href: '/businesses', Icon: IcoStore16, text: t('businesses') },
    { href: '/playbooks', Icon: IcoBook16, text: t('playbooks') },
    { href: '/security-logs', Icon: IcoFileText16, text: t('security-logs') },
    { href: '/developers', Icon: IcoCode16, text: t('developers') },
    { href: '/settings', Icon: IcoSettings16, text: t('settings') },
  ];

  return (
    <NavContainer>
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
            disabled={!userWouldBeRedirected && sandbox.canToggle}
            text={
              userWouldBeRedirected
                ? tooltipInfoText
                : t('sandbox-mode.tooltip-disabled')
            }
            alignment="end"
            position="bottom"
          >
            <Toggle
              size="compact"
              checked={sandbox.isSandbox}
              disabled={!sandbox.canToggle}
              label={t('sandbox-mode.label')}
              onChange={toggleSandboxMode}
            />
          </Tooltip>
        </Box>
      </Container>
    </NavContainer>
  );
};

const NavContainer = styled.div`
  ${({ theme }) => css`
    border-top: 1px solid ${theme.borderColor.tertiary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.secondary};
    padding: ${theme.spacing[3]} 0;
    margin-bottom: ${theme.spacing[7]};
  `};
`;

export default Nav;
