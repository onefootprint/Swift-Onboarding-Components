import React from 'react';
import styled, { css } from 'styled';
import { Container, media, Typography } from 'ui';

const currentYear = new Date().getFullYear();

type FooterProps = {
  copyright: string;
  links: { text: string; href: string }[];
};

const Footer = ({ copyright, links }: FooterProps) => (
  <Container as="footer">
    <Inner>
      <Typography variant="body-3" color="senary">
        © {currentYear} {copyright}
      </Typography>
      <LinksList>
        {links.map(link => (
          <li key={link.text}>
            <a href={link.href} rel="noopener noreferrer" target="_blank">
              <Typography variant="body-3" color="senary">
                {link.text}
              </Typography>
            </a>
          </li>
        ))}
      </LinksList>
    </Inner>
  </Container>
);

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[6]}px 0;
    margin-top: ${theme.spacing[10]}px;

    ${media.greaterThan('lg')`
      margin-top: ${theme.spacing[11]}px;
    `}
  `}
`;

const LinksList = styled.ul`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;

    li {
      list-style: none;
      margin-left: ${theme.spacing[4]}px;
    }

    a {
      text-decoration: none;
    }
  `}
`;

export default Footer;
