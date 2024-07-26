import { IcoArrowUpRight16 } from '@onefootprint/icons';
import { Box, LinkButton, ThemeToggle, media } from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { API_REFERENCE_PATH } from 'src/config/constants';
import styled, { css } from 'styled-components';

import { useRouter } from 'next/router';
import SupportList from '../support-list';
import LoggedInUser from './components/logged-in-user';

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

  return (
    <Container>
      <LoggedInUser />
      <ExternalLink>
        <LinkButton href={isApiReference ? '/' : API_REFERENCE_PATH} iconComponent={IcoArrowUpRight16}>
          {isApiReference ? t('docs') : t('api-reference')}
        </LinkButton>
      </ExternalLink>
      <SupportList />
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

const ExternalLink = styled.div`
  ${({ theme }) => css`
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[6]};

    ${media.greaterThan('sm')`
       padding: ${theme.spacing[5]} ${theme.spacing[6]};
    `}
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
