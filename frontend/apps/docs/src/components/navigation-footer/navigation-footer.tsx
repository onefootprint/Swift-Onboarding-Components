import { IcoArrowUpRight16, IcoHelp16 } from '@onefootprint/icons';
import { Box, Button, LinkButton, Stack, ThemeToggle, media } from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_REFERENCE_PATH } from 'src/config/constants';
import styled, { css } from 'styled-components';

import { useRouter } from 'next/router';
import useSession from 'src/hooks/use-session';
import { useEffectOnce } from 'usehooks-ts';
import CompanyName from './components/company-name';
import LinkItem from './components/link-item/link-item';
import NavDropdown from './components/nav-dropdown/nav-dropdown';
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
    refreshPermissions,
  } = useSession();

  useEffectOnce(() => {
    refreshPermissions().catch(() => {
      // No-op on error
      return;
    });
  });

  const handleOpenSupportDialog = () => {
    setShowSupportDialog(true);
  };

  const handleCloseSupportDialog = () => {
    setShowSupportDialog(false);
  };

  const handleSignIn = () => {
    const currentPath = `${window.location.pathname}${window.location.search}`;
    router.push({ pathname: '/login', query: { redirectUrl: currentPath } });
  };

  return (
    <Container>
      {user?.tenant.name && (
        <Stack direction="row" justify="space-between" height="56px" align="center" padding={5} width="100%">
          <CompanyName name={user.tenant.name} image={user.tenant.logoUrl} />
          <NavDropdown user={user} isApiReference={isApiReference} handleOpenSupportDialog={handleOpenSupportDialog} />
        </Stack>
      )}
      {!user && (
        <Stack direction="column" gap={4} marginTop={4} marginBottom={3} marginLeft={4} marginRight={4}>
          <Button onClick={handleSignIn} variant="secondary">
            {t('sign-in')}
          </Button>
          <Stack direction="column" marginLeft={3} marginRight={3}>
            <Box height="32px" alignContent="center">
              <LinkButton href={isApiReference ? '/' : API_REFERENCE_PATH} iconComponent={IcoArrowUpRight16}>
                {isApiReference ? t('dropdown.docs') : t('dropdown.api-reference')}
              </LinkButton>
            </Box>
            <LinkItem IconComponent={IcoHelp16} label={t('need-help.label')} onClick={handleOpenSupportDialog} />
          </Stack>
        </Stack>
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
