import { useTranslation } from 'hooks';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';
import { Container, media, Typography } from 'ui';

const currentYear = new Date().getFullYear();

const PageFooter = () => {
  const { t } = useTranslation('components.footer');

  const links = [
    {
      text: t('links.terms-of-service.text'),
      href: t('links.terms-of-service.href'),
      newWindow: false,
    },
    {
      text: t('links.privacy-policy.text'),
      href: t('links.privacy-policy.href'),
      newWindow: false,
    },
    {
      text: t('links.status.text'),
      href: t('links.status.href'),
      newWindow: true,
    },
    {
      text: t('links.twitter.text'),
      href: t('links.twitter.href'),
      newWindow: true,
    },
  ];

  return (
    <Container as="footer">
      <Inner>
        <Typography variant="body-3" color="secondary">
          © {currentYear} {t('copyright')}
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
                    <Typography variant="body-3" color="secondary">
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
};

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]}px;
    margin-top: ${theme.spacing[10]}px;
    padding: ${theme.spacing[4]}px 0 ${theme.spacing[9]}px;
    text-align: center;
    align-items: center;

    ${media.greaterThan('md')`
      flex-direction: row;
      justify-content: space-between;
      margin-top: ${theme.spacing[13]}px;
      padding: ${theme.spacing[4]}px 0;
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

export default PageFooter;
