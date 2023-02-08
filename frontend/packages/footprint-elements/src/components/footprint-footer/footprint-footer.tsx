import { Typography } from '@onefootprint/ui';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';

import SecuredByFootprint from '../secured-by-footprint';
import type { Link } from './footprint-footer.types';

const FootprintFooter = () => {
  const router = useRouter();

  const links: Link[] = [
    {
      label: "What's this?",
      href: `https://www.onefootprint.com/tenant?ob-key=${
        router.query.public_key as string
      }`,
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
    background-color: ${theme.backgroundColor.secondary};
    border-radius: 0 0 ${theme.borderRadius.default}
      ${theme.borderRadius.default};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
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
