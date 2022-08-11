import { createPopup } from '@typeform/embed';
import { useHasScroll, useTranslation } from 'hooks';
import IcoDatabase16 from 'icons/ico/ico-database-16';
import IcoLogoFpCompact from 'icons/ico/ico-logo-fp-compact';
import IcoShield16 from 'icons/ico/ico-shield-16';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import styled, { css } from 'styled-components';
import { Button, Container, Tab, Typography } from 'ui';

const { toggle: toggleTypeform } = createPopup('COZNk70C');

const PageHeader = () => {
  const { t } = useTranslation('components.header');
  const router = useRouter();
  // TODO: add better mobile support
  // https://linear.app/footprint/issue/FP-1002/add-better-support-for-mobile-docs-experience
  const hasScroll = useHasScroll();

  const routes = [
    { href: '/kyc-with-pii', Icon: IcoShield16, text: t('nav.kyc-with-pii') },
    { href: '/pii', Icon: IcoDatabase16, text: t('nav.pii') },
  ];

  return (
    <Header isFloating={hasScroll}>
      <Container>
        <Inner>
          <Title>
            <IcoLogoFpCompact />
            <Typography
              variant="label-2"
              color="tertiary"
              sx={{ marginLeft: 3 }}
            >
              {t('title')}
            </Typography>
          </Title>
          <Button onClick={toggleTypeform} size="small">
            {t('request-early-access')}
          </Button>
        </Inner>
      </Container>
      <Nav>
        <Container>
          <Tab.List>
            {routes.map(({ href, Icon, text }) => (
              <Link href={href} key={text}>
                <Tab.Item
                  href={href}
                  iconComponent={Icon}
                  selected={router.pathname.startsWith(href)}
                >
                  {text}
                </Tab.Item>
              </Link>
            ))}
          </Tab.List>
        </Container>
      </Nav>
    </Header>
  );
};

const Nav = styled.nav`
  ${({ theme }) => css`
    border-top: 1px solid ${theme.borderColor.tertiary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.secondary};
    padding: ${theme.spacing[3]}px 0;
  `};
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${theme.spacing[4]}px 0;
  `};
`;

const Header = styled.header<{ isFloating: boolean }>`
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  transition: background 200ms ease 0s;
  ${({ theme }) => css`
    z-index: ${theme.zIndex.overlay};
  `}
  ${({ isFloating }) =>
    isFloating &&
    css`
      backdrop-filter: blur(15px) saturate(125%);
      background-color: rgba(255, 255, 255, 0.75);
    `}
`;

export default PageHeader;
