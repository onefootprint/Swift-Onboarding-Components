import { DOCS_BASE_URL } from '@onefootprint/global-constants';
import { IcoArrowUpRight16 } from '@onefootprint/icons';
import { createFontStyles, Dropdown } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { OPTION_HEIGHT } from '../../nav-dropdown.constants';
import SectionContainer from '../section-container';
import SectionTitle from '../section-title';

type TranslationKeys =
  | 'documentation'
  | 'api-reference'
  | 'risk-signals-glossary';

interface HelpLink {
  id: string;
  href?: string;
  onClick?: () => void;
  translationKey: TranslationKeys;
}

const helpLinks: HelpLink[] = [
  {
    id: 'documentation',
    href: DOCS_BASE_URL,
    translationKey: 'documentation',
  },
  {
    id: 'api-documentation',
    href: `${DOCS_BASE_URL}/api`,
    translationKey: 'api-reference',
  },
  {
    id: 'risk-signals-glossary',
    onClick: () => {},
    translationKey: 'risk-signals-glossary',
  },
];

const HelpLinks = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.private-layout.nav.help-links',
  });
  return (
    <SectionContainer>
      <SectionTitle>{t('title')}</SectionTitle>
      {helpLinks.map(
        link =>
          link.href && (
            <StyledLink
              key={link.id}
              onSelect={() => window.open(link.href, '_blank')}
            >
              {t(`${link.translationKey}`)}
              <IcoArrowUpRight16 color="secondary" />
            </StyledLink>
          ),
      )}
    </SectionContainer>
  );
};

const StyledLink = styled(Dropdown.Item)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    text-decoration: none;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    color: ${theme.color.secondary};
    cursor: pointer;
    height: ${OPTION_HEIGHT};

    &:hover {
      color: ${theme.color.primary};
      background-color: ${theme.backgroundColor.secondary};
    }

    svg {
      margin-top: 2px;
    }
  `}
`;

export default HelpLinks;
