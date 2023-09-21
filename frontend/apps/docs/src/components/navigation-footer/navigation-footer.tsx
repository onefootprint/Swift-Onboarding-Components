import { useTranslation } from '@onefootprint/hooks';
import { IcoArrowUpRight16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { LinkButton, media, ThemeToggle } from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import React from 'react';

import SupportList from '../support-list';

const API_REFERENCE_URL =
  'https://api-docs.onefootprint.com/docs/footprint-public-docs/9609ff8a78f56-footprint-api';

type NavigationFooterProps = {
  linkTo: 'api-reference' | 'docs';
};

const NavigationFooter = ({ linkTo }: NavigationFooterProps) => {
  const { t } = useTranslation('components.navigation-footer');
  const { theme, setTheme } = useTheme();
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };
  return (
    <Container>
      <ExternalLink>
        <LinkButton
          href={linkTo === 'api-reference' ? API_REFERENCE_URL : '/'}
          size="compact"
          iconComponent={IcoArrowUpRight16}
        >
          {linkTo === 'api-reference' ? t('api-reference') : t('docs')}
        </LinkButton>
      </ExternalLink>
      <SupportList />
      <ThemeContainer>
        <ThemeToggle
          onChange={handleToggleTheme}
          checked={theme === 'dark'}
          label={t('theme')}
        />
      </ThemeContainer>
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
