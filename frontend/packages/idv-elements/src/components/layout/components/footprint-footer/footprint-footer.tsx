import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import styled, { css } from '@onefootprint/styled';
import { media, Stack, Typography } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import useResizeObserver from 'use-resize-observer';

import { FOOTPRINT_FOOTER_ID } from '../../constants';
import { useLayoutOptions } from '../layout-options-provider';
import SecuredByFootprint from '../secured-by-footprint';
import FooterActions from './components/footer-actions';

type FootprintFooterProps = {
  hideOnDesktop?: boolean;
  onWhatsThisClick?: () => void;
};

const FootprintFooter = ({
  hideOnDesktop,
  onWhatsThisClick,
}: FootprintFooterProps) => {
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
      hideOnDesktop={hideOnDesktop}
      isSticky={footerPosition === 'sticky'}
      isVisible={footerVisible}
      ref={ref}
      id={FOOTPRINT_FOOTER_ID}
    >
      <SecuredByFootprint />
      <LinksContainer as="ul" align="center" justify="center" gap={3}>
        <li>
          <WhatsThisButton onClick={onWhatsThisClick}>
            <Typography variant="caption-1" color="secondary" as="span">
              What&apos;s this?
            </Typography>
          </WhatsThisButton>
        </li>
        <li>
          <a
            href={`${FRONTPAGE_BASE_URL}/privacy-policy`}
            target="_blank"
            rel="noreferrer"
          >
            <Typography variant="caption-1" color="secondary" as="span">
              Privacy
            </Typography>
          </a>
        </li>
      </LinksContainer>
      <ActionsWrapper>
        <FooterActions onWhatsThisClick={onWhatsThisClick} />
      </ActionsWrapper>
    </FootprintFooterContainer>
  );
};

const WhatsThisButton = styled.button`
  all: unset;
  cursor: pointer;
`;

const FootprintFooterContainer = styled.footer<{
  hideOnDesktop?: boolean;
  isSticky: boolean;
  isVisible: boolean;
}>`
  ${({ theme, isSticky }) => css`
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    flex: 0;
    position: ${isSticky ? 'sticky' : 'relative'};
    bottom: ${isSticky ? 0 : undefined};
    z-index: ${isSticky ? theme.zIndex.sticky : 1};
    background-color: ${theme.backgroundColor.secondary};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}

  ${({ isVisible }) =>
    !isVisible &&
    css`
      display: none;
    `}

  ${({ hideOnDesktop }) =>
    !!hideOnDesktop &&
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

    a {
      text-decoration: none;
      color: ${theme.color.secondary};

      @media (hover: hover) {
        &:hover {
          text-decoration: underline;
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
