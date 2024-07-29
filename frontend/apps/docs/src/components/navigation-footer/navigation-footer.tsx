import { IcoArrowUpRight16, IcoHelp16 } from '@onefootprint/icons';
import { Stack, ThemeToggle, media } from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_REFERENCE_PATH } from 'src/config/constants';
import styled, { css } from 'styled-components';

import { useRouter } from 'next/router';
import useSession from 'src/hooks/use-session';
import LinkItem from './components/link-item';
import LoggedInUser from './components/logged-in-user';
import NavDropdown from './components/nav-dropdown';
import SupportDialog from './components/support-dialog';

const NavigationFooter = () => {
  const router = useRouter();
  const isApiReference = router.pathname.startsWith(API_REFERENCE_PATH) || router.asPath.startsWith(API_REFERENCE_PATH);
  const { t } = useTranslation('common', {
    keyPrefix: 'components.navigation-footer',
  });
  const { theme, setTheme } = useTheme();
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };
  const [showSupportDialog, setShowSupportDialog] = useState(false);
  const {
    data: { user },
  } = useSession();

  const handleOpenSupportDialog = () => {
    setShowSupportDialog(true);
  };

  const handleCloseSupportDialog = () => {
    setShowSupportDialog(false);
  };

  const handleDocsClick = () => {
    router.push(isApiReference ? '/' : API_REFERENCE_PATH);
  };

  return (
    <Container>
      {user && (
        <LoggedInUser user={user}>
          <NavDropdown user={user} isApiReference={isApiReference} handleOpenSupportDialog={handleOpenSupportDialog} />
        </LoggedInUser>
      )}
      {!user && (
        <>
          {/* TODO sign in button */}
          <Stack direction="column" marginTop={2} marginBottom={2} marginLeft={6} marginRight={6}>
            <LinkItem
              IconComponent={IcoArrowUpRight16}
              label={isApiReference ? t('dropdown.docs') : t('dropdown.api-reference')}
              onClick={handleDocsClick}
            />
            <LinkItem IconComponent={IcoHelp16} label={t('need-help.label')} onClick={handleOpenSupportDialog} />
          </Stack>
        </>
      )}
      <SupportDialog
        title={t('need-help.dialog.title')}
        description={t('need-help.dialog.description')}
        open={showSupportDialog}
        onClose={handleCloseSupportDialog}
      />
      {!isApiReference && (
        <ThemeContainer>
          <ThemeToggle onChange={handleToggleTheme} checked={theme === 'dark'} label={t('theme')} />
        </ThemeContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const ThemeContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: ${theme.spacing[5]} ${theme.spacing[6]};
    background-color: ${theme.backgroundColor.secondary};

    ${media.greaterThan('sm')` 
        display: none;
    `}
  `}
`;

export default NavigationFooter;
