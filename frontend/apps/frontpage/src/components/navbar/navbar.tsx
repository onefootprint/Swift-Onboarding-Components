import { useToggle, useTranslation } from 'hooks';
import React from 'react';
import styled, { css } from 'styled-components';
import { Container, media } from 'ui';

import DesktopNav from './components/desktop-nav';
import MobileNav from './components/mobile-nav';
import useHasScroll from './hooks/use-has-scroll';

type NavbarProps = {
  cta: {
    text: string;
    onClick: () => void;
  };
};

const Navbar = ({ cta }: NavbarProps) => {
  const [isFloatingEnabled, enableFloating, disableFloating] = useToggle(true);
  const hasScroll = useHasScroll();
  const { t } = useTranslation('components.navbar');

  const links = [
    { text: t('links.compare.text'), href: t('links.compare.href') },
    { text: t('links.pricing.text'), href: t('links.pricing.href') },
    { text: t('links.company.text'), href: t('links.company.href') },
    { text: t('links.faq.text'), href: t('links.faq.href') },
  ];

  return (
    <Header isFloating={hasScroll && isFloatingEnabled}>
      <Container>
        <Inner>
          <MobileNav
            onOpen={disableFloating}
            onClose={enableFloating}
            cta={{
              text: cta.text,
              onClick: cta.onClick,
            }}
            links={links}
          />
          <DesktopNav
            cta={{
              text: cta.text,
              onClick: cta.onClick,
            }}
            links={links}
          />
        </Inner>
      </Container>
    </Header>
  );
};

const Header = styled.header<{ isFloating: boolean }>`
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  transition: background 200ms ease 0s;
  z-index: 20;

  ${({ theme, isFloating }) =>
    isFloating &&
    css`
      backdrop-filter: blur(15px) saturate(125%);
      background-color: rgba(255, 255, 255, 0.75);
      border-bottom: ${theme.borderWidth[1]}px solid
        ${theme.borderColor.primary};
    `}
`;

const Inner = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[6]}px 0 ${theme.spacing[5]}px;

    ${media.greaterThan('md')`
      padding:  ${theme.spacing[4]}px;
    `}
  `}
`;

export default Navbar;
