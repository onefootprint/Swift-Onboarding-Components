import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';
import { Container, media, Typography } from 'ui';

const currentYear = new Date().getFullYear();

type FooterProps = {
  copyright: string;
  links: { text: string; href: string; newWindow: boolean }[];
};

const Footer = ({ copyright, links }: FooterProps) => (
  <Container as="footer">
    <Inner>
      <Typography variant="body-3" color="senary">
        © {currentYear} {copyright}
      </Typography>
      <NavContainer>
        <Nav>
          {links.map(link => (
            <li key={link.text}>
              <Link
                href={link.href}
                rel="noopener noreferrer"
                target={link.newWindow ? '_blank' : undefined}
              >
                <a
                  href={link.href}
                  rel="noopener noreferrer"
                  target={link.newWindow ? '_blank' : undefined}
                >
                  <Typography variant="body-3" color="senary">
                    {link.text}
                  </Typography>
                </a>
              </Link>
            </li>
          ))}
        </Nav>
        <Image
          height={40}
          width={40}
          layout="fixed"
          alt="SOC 2 badge"
          src="/footer/soc-2-badge.png"
        />
      </NavContainer>
    </Inner>
  </Container>
);

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]}px;
    margin-top: ${theme.spacing[10]}px;
    padding: ${theme.spacing[6]}px 0 ${theme.spacing[9]}px;
    text-align: center;
    align-items: center;

    ${media.greaterThan('md')`
      flex-direction: row;
      justify-content: space-between;
      margin-top: ${theme.spacing[11]}px;
      padding: ${theme.spacing[6]}px 0;
      text-align: unset;
    `}
  `}
`;

const NavContainer = styled.nav`
  ${({ theme }) => css`
    ${media.greaterThan('md')`
      display: flex;
      align-items: center;
      gap: ${theme.spacing[5]}px;
    `}
  `}
`;

const Nav = styled.ul`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    gap: ${theme.spacing[5]}px;
    margin-bottom: ${theme.spacing[7]}px;

    ${media.greaterThan('md')`
      margin-bottom: unset;
    `}

    li {
      list-style: none;
    }

    a {
      text-decoration: none;
    }
  `}
`;

export default Footer;
