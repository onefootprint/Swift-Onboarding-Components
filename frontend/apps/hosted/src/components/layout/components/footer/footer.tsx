import { SecuredByFootprint } from '@onefootprint/footprint-elements';
import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

type Link = { label: string; href: string };

const Footer = () => {
  const links: Link[] = [
    {
      label: 'Privacy',
      href: `${FRONTPAGE_BASE_URL}/privacy-policy`,
    },
    {
      label: 'Terms',
      href: 'https://onefootprint.com/terms-of-service',
    },
  ];

  return (
    <Container>
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
        <li>
          <Image
            src="/footer/soc-2-badge.png"
            height={32}
            width={32}
            alt="Soc2 badge"
          />
        </li>
      </LinksContainer>
    </Container>
  );
};

const Container = styled.footer`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: ${theme.spacing[7]} 0 ${theme.spacing[5]};
  `};
`;

const LinksContainer = styled.ul`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: center;
    gap: ${theme.spacing[7]};

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
