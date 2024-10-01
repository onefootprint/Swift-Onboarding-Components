import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { Stack, Text, media } from '@onefootprint/ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import useResizeObserver from 'use-resize-observer';

import Link from 'next/link';
import { FOOTPRINT_FOOTER_ID } from '../../constants';
import { useLayoutOptions } from '../layout-options-provider';
import SecuredByFootprint from '../secured-by-footprint';
import FooterActions from './components/footer-actions';
import LanguageSelect from './components/language-select';
import SupportLinksSelect from './components/support-links-select';

type FootprintFooterProps = {
  hideOnDesktop?: boolean;
  onWhatsThisClick?: () => void;
  config?: PublicOnboardingConfig;
};

const FootprintFooter = ({ hideOnDesktop, onWhatsThisClick, config }: FootprintFooterProps) => {
  const { t /* i18n */ } = useTranslation('idv', {
    keyPrefix: 'global.components.footer',
  });
  const {
    footer: { options, set: updateFooterOptions },
  } = useLayoutOptions();
  const { visible: footerVisible, position: footerPosition } = options;
  const { ref, height } = useResizeObserver({
    box: 'border-box',
  });

  useEffect(() => {
    if (!footerVisible) updateFooterOptions({ height: 0 });
    else updateFooterOptions({ height: height ?? 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height]);

  return (
    <FootprintFooterContainer
      $hideOnDesktop={hideOnDesktop}
      $isSticky={footerPosition === 'sticky'}
      $isVisible={footerVisible}
      id={FOOTPRINT_FOOTER_ID}
      ref={ref}
    >
      <SecuredByFootprint />
      <LinksContainer align="center" justify="center" gap={3}>
        <SupportLinksSelect config={config} />
        <WhatsThisButton onClick={onWhatsThisClick} className="footer-link">
          <Text variant="caption-1" color="secondary" tag="span">
            {t('whats-this')}
          </Text>
        </WhatsThisButton>
        <Link href={`${FRONTPAGE_BASE_URL}/privacy-policy`} target="_blank" rel="noreferrer" className="footer-link">
          <Text variant="caption-1" color="secondary" tag="span">
            {t('privacy')}
          </Text>
        </Link>
        <LanguageSelect />
      </LinksContainer>
      <ActionsWrapper>
        <FooterActions onWhatsThisClick={onWhatsThisClick} config={config} />
      </ActionsWrapper>
    </FootprintFooterContainer>
  );
};

const WhatsThisButton = styled.button`
  all: unset;
  cursor: pointer;
`;

const FootprintFooterContainer = styled.footer<{
  $hideOnDesktop?: boolean;
  $isSticky: boolean;
  $isVisible: boolean;
}>`
  ${({ theme, $isSticky }) => css`
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    flex: 0;
    position: ${$isSticky ? 'sticky' : 'relative'};
    bottom: ${$isSticky ? 0 : undefined};
    z-index: ${$isSticky ? theme.zIndex.sticky : 1};
    background-color: ${theme.backgroundColor.secondary};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}

  ${({ $isVisible }) =>
    !$isVisible &&
    css`
      display: none;
    `}

  ${({ $hideOnDesktop }) =>
    !!$hideOnDesktop &&
    css`
      ${media.greaterThan('md')`
        display: none;
      `}
    `}
`;

const LinksContainer = styled(Stack)`
  ${({ theme }) => css`
    ${media.lessThan('sm')`
      display: none;
    `}

    .footer-link {
      text-decoration: none;
      color: ${theme.color.secondary};

      @media (hover: hover) {
        &:hover {
          text-decoration: underline;
          text-decoration-thickness: 1.5px;
          display: inline-block;
        }
      }
    }
  `}
`;

const ActionsWrapper = styled.div`
  ${media.greaterThan('sm')`
    display: none;
  `}
`;

export default FootprintFooter;
