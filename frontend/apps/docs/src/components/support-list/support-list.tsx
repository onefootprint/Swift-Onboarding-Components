import { useTranslation } from '@onefootprint/hooks';
import { IcoArrowUpRight16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  createFontStyles,
  LinkButton,
  media,
  ThemeToggle,
} from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import React from 'react';

import NeedHelp from './components/need-help';
import SendFeedback from './components/send-feedback';

const API_REFERENCE_URL =
  'https://api-docs.onefootprint.com/docs/footprint-public-docs';

const SupportList = () => {
  const { t } = useTranslation('components.side-navigation.api-reference');
  const { theme, setTheme } = useTheme();
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  return (
    <Container>
      <ApiReferenceContainer>
        <LinkButton
          href={API_REFERENCE_URL}
          iconComponent={IcoArrowUpRight16}
          size="compact"
        >
          {t('label')}
        </LinkButton>
      </ApiReferenceContainer>
      <ThemeContainer>
        <ThemeToggle
          onChange={handleToggleTheme}
          checked={theme === 'dark'}
          label={t('theme')}
        />
      </ThemeContainer>
      <SupportLinks>
        <li>
          <SendFeedback />
        </li>
        <li>
          <NeedHelp />
        </li>
      </SupportLinks>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    padding-bottom: ${theme.spacing[12]};

    ${media.greaterThan('md')`
      padding-bottom: 0;
    `}
  `}
`;

const ThemeContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: ${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[3]};

    ${media.greaterThan('md')` 
      display: none;
    `}
  `}
`;

const SupportLinks = styled.ul`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding-bottom: ${theme.spacing[4]};
    gap: ${theme.spacing[4]};

    a {
      ${createFontStyles('label-3')};
      align-items: center;
      color: ${theme.color.tertiary};
      display: flex;
      gap: ${theme.spacing[3]};
      padding-left: ${theme.spacing[3]};
      text-decoration: none;

      @media (hover: hover) {
        &:hover {
          color: ${theme.color.secondary};

          path {
            fill: ${theme.color.secondary};
          }
        }
      }
    }
  `}
`;

const ApiReferenceContainer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]} ${theme.spacing[4]} ${theme.spacing[4]}
      ${theme.spacing[4]};

    ${media.greaterThan('sm')`
       padding: ${theme.spacing[5]} ${theme.spacing[4]};
    `}
  `}
`;

export default SupportList;
