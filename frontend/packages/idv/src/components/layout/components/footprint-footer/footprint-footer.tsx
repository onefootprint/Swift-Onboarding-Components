import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { media, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import useIdvMachine from '../../../../hooks/use-idv-machine';
import SecuredByFootprint from './components/secured-by-footprint';

type FootprintFooterProps = {
  variant?: 'modal' | 'mobile';
  hideOnDesktop?: boolean;
};

type Link = { label: string; href: string };

const FootprintFooter = ({
  variant = 'modal',
  hideOnDesktop,
}: FootprintFooterProps) => {
  const { t } = useTranslation('components.layout.footprint-footer');
  const [state] = useIdvMachine();
  const { tenantPk } = state.context;

  const links: Link[] = [
    {
      label: t('what-is-this'),
      href: `${FRONTPAGE_BASE_URL}/tenant?ob-key=${tenantPk}`,
    },
    {
      label: t('privacy-policy'),
      href: `${FRONTPAGE_BASE_URL}/privacy-policy`,
    },
  ];

  return (
    <FootprintFooterContainer variant={variant} hideOnDesktop={!!hideOnDesktop}>
      <SecuredByFootprint />
      <LinksContainer>
        {links.map(({ href, label }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noreferrer">
              <Typography variant="caption-1" color="secondary" as="span">
                {label}
              </Typography>
            </a>
          </li>
        ))}
      </LinksContainer>
    </FootprintFooterContainer>
  );
};

const FootprintFooterContainer = styled.footer<{
  variant: 'modal' | 'mobile';
  hideOnDesktop: boolean;
}>`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
  `}

  ${({ variant, theme }) =>
    variant === 'modal' &&
    css`
      background-color: ${theme.backgroundColor.secondary};
      border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      flex-direction: row;
    `}

  ${({ variant, theme }) =>
    variant === 'mobile' &&
    css`
      gap: ${theme.spacing[4]};
      align-items: center;
      flex-direction: column;
    `}

  ${({ hideOnDesktop }) =>
    !!hideOnDesktop &&
    css`
      ${media.greaterThan('md')`
        display: none;
      `}
    `}
`;

const LinksContainer = styled.ul`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: center;
    gap: ${theme.spacing[2]};

    li {
      &:not(:last-child) {
        &:after {
          content: '·';
          margin: 0 ${theme.spacing[2]};
        }
      }
    }

    a {
      text-decoration: none;
      color: ${theme.color.secondary};

      &:hover {
        text-decoration: underline;
      }
    }
  `}
`;

export default FootprintFooter;
