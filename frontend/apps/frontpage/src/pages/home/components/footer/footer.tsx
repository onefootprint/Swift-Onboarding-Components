import React from 'react';
import styled, { css } from 'styled';
import { Container, Typography } from 'ui';

const currentYear = new Date().getFullYear();

type FooterProps = {
  copyrightText: string;
  links: { text: string; href: string }[];
};

const Footer = ({ copyrightText, links }: FooterProps) => (
  <Container as="footer">
    <Inner>
      <Typography variant="body-3" color="quinary">
        © {currentYear} {copyrightText}
      </Typography>
      <LinksList>
        {links.map(link => (
          <li key={link.text}>
            <a href={link.href} rel="noopener noreferrer" target="_blank">
              <Typography variant="body-3" color="quinary">
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
