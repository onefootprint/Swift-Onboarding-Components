import React from 'react';
import styled, { css } from 'styled-components';
import { media, Typography } from 'ui';

import EncryptedByFootprint from './components/encrypted-by-footprint';
import type { Link } from './footer.types';

const Footer = () => {
  const links: Link[] = [
    {
      label: 'Privacy',
      href: 'https://www.onefootprint.com/privacy-policy',
    },
    {
      label: 'Contact Us',
      href: 'href=mailto:hello@onefootprint.com',
    },
  ];

  return (
    <Container>
      <EncryptedByFootprint />
      <LinksContainer>
        {links.map(({ href, label }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noreferrer">
              <Typography variant="body-4" color="tertiary" as="span">
                {label}
              </Typography>
            </a>
          </li>
        ))}
      </LinksContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[4]}px ${theme.spacing[7]}px;
    flex-direction: column;

    > :not(:first-child) {
      margin-top: ${theme.spacing[3]}px;
    }

    ${media.greaterThan('sm')`
      flex-direction: row;
      margin-left: ${theme.spacing[10]}px;
      margin-right: ${theme.spacing[10]}px;

      > :not(:first-child) {
        margin: 0;
      }
    `}
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
          margin: 0 ${theme.spacing[3]}px;
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

export default Footer;
