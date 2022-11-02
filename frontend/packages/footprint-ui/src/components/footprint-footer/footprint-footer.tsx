import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import SecuredByFootprint from './components/secured-by-footprint';
import type { Link } from './footprint-footer.types';

const FootprintFooter = () => {
  const links: Link[] = [
    {
      label: "What's this?",
      href: 'https://www.onefootprint.com',
    },
    {
      label: 'Privacy',
      href: 'https://www.onefootprint.com/privacy-policy',
    },
  ];

  return (
    <FootprintFooterContainer>
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

const FootprintFooterContainer = styled.footer`
  ${({ theme }) => css`
    position: sticky;
    z-index: ${theme.zIndex.sticky};
    bottom: 0;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: 0 0 ${theme.borderRadius.default}px
      ${theme.borderRadius.default}px;
    border-top: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: ${theme.spacing[4]}px ${theme.spacing[7]}px;
  `}
`;

const LinksContainer = styled.ul`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: center;

    li {
      &:not(:last-child) {
        &:after {
          content: '·';
          margin: 0 ${theme.spacing[2]}px;
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
