import { useHasScroll, useToggle, useTranslation } from 'hooks';
import React from 'react';
import styled, { css } from 'styled-components';
import { Banner, Container, media } from 'ui';

import DesktopNav from './components/desktop-nav';
import MobileNav from './components/mobile-nav';

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
    { text: t('links.blog.text'), href: t('links.blog.href') },
    { text: t('links.media.text'), href: t('links.media.href') },
  ];

  return (
    <Header isFloating={hasScroll && isFloatingEnabled}>
      <BannerContainer>
        <Banner variant="announcement">
          {t('banner.text')}{' '}
          <a
            href="https://techcrunch.com/2022/08/03/footprint-wants-to-change-how-companies-collect-store-and-share-personal-data/"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('banner.link-label')}
          </a>
        </Banner>
      </BannerContainer>
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

const BannerContainer = styled.div`
  ${({ theme }) => css`
    border-bottom: 1px solid ${theme.borderColor.tertiary};
  `}
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
