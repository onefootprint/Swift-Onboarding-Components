import { ThemedLogoFpCompact } from '@onefootprint/icons';
import { Stack, Toggle, Tooltip } from '@onefootprint/ui';
import { omit } from 'lodash';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PUBLIC_ROUTE } from 'src/config/constants';
import useOrgSession from 'src/hooks/use-org-session';
import styled, { css } from 'styled-components';

const TopMenuBar = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.private-layout.nav',
  });

  const { sandbox } = useOrgSession();

  const tooltipInfoText = sandbox.isSandbox
    ? t('sandbox-mode.tooltip-info.sandbox')
    : t('sandbox-mode.tooltip-info.live');

  const toggleSandboxMode = async () => {
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
    await sandbox.toggle();
  };
  const router = useRouter();

  const userWouldBeRedirected =
    router.pathname.startsWith('/users/[id]') || router.pathname.startsWith('/businesses/[id]');
  return (
    <Container direction="row" justify="space-between" align="center">
      <Link href={DEFAULT_PUBLIC_ROUTE} aria-label={t('home')}>
        <Footprint>
          <ThemedLogoFpCompact color="primary" />
        </Footprint>
      </Link>
      <Tooltip
        disabled={!userWouldBeRedirected && sandbox.canToggle}
        text={userWouldBeRedirected ? tooltipInfoText : t('sandbox-mode.tooltip-disabled')}
        alignment="end"
        position="bottom"
      >
        <Toggle
          labelPlacement="left"
          size="compact"
          checked={sandbox.isSandbox}
          disabled={!sandbox.canToggle}
          label={t('sandbox-mode.label')}
          onChange={toggleSandboxMode}
        />
      </Tooltip>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    padding: 0 ${theme.spacing[7]};
    background-color: ${theme.backgroundColor.primary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    width: 100%;
    min-height: 48px;
  `};
`;

const Footprint = styled.i`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    align-items: center;
    padding: ${theme.spacing[4]} 0;
  `};
`;

export default TopMenuBar;
