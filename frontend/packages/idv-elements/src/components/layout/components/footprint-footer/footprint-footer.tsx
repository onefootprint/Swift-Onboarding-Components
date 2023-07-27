import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import styled, { css } from '@onefootprint/styled';
import { media, Typography } from '@onefootprint/ui';
import React from 'react';

import SecuredByFootprint from '../secured-by-footprint';
import FooterActions from './components/footer-actions';

type FootprintFooterProps = {
  hideOnDesktop?: boolean;
  tenantPk?: string;
};

type Link = { label: string; href: string };

const FootprintFooter = ({ hideOnDesktop, tenantPk }: FootprintFooterProps) => {
  const links: Link[] = [
    {
      label: 'Privacy Policy',
      href: `${FRONTPAGE_BASE_URL}/privacy-policy`,
    },
  ];

  if (tenantPk) {
    links.unshift({
      label: "What's this?",
      href: `${FRONTPAGE_BASE_URL}/tenant?ob-key=${tenantPk}`,
    });
  }

  return (
    <FootprintFooterContainer hideOnDesktop={hideOnDesktop}>
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
      <ActionsWrapper>
        <FooterActions links={links} />
      </ActionsWrapper>
    </FootprintFooterContainer>
  );
};

const FootprintFooterContainer = styled.footer<{
  hideOnDesktop?: boolean;
}>`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    flex: 0;
    background-color: ${theme.backgroundColor.secondary};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
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

    ${media.lessThan('sm')`
      display: none;
    `}

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

      @media (hover: hover) {
        &:hover {
          text-decoration: underline;
        }
      }
    }
  `}
`;

const ActionsWrapper = styled.div`
  ${media.greaterThan('sm')`
    display: none;
  `}
`;

export default FootprintFooter;
