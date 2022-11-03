import { Container, media, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import EncryptedByFootprint from './components/encrypted-by-footprint';
import type { Link } from './footer.types';

const Footer = () => {
  const links: Link[] = [
    {
      label: 'Privacy',
      href: 'https://www.onefootprint.com/privacy-policy',
    },
    {
      label: 'Terms',
      href: 'https://www.onefootprint.com/terms-of-service',
    },
    {
      label: 'Contact Us',
      href: 'href=mailto:hello@onefootprint.com',
    },
  ];

  return (
    <Container>
      <Inner>
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
      </Inner>
    </Container>
  );
};

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[4]} ${theme.spacing[7]};
    flex-direction: column;

    > :not(:first-child) {
      margin-top: ${theme.spacing[3]};
    }

    ${media.greaterThan('md')`
      flex-direction: row;
      margin-left: ${theme.spacing[10]};
      margin-right: ${theme.spacing[10]};

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
          margin: 0 ${theme.spacing[3]};
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
