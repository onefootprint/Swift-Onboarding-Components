import styled, { css } from '@onefootprint/styled';
import { Banner, media } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';

export type SandboxBannerHandler = {
  getHeight: () => number;
};

type SandboxBannerProps = {
  hideOnDesktop?: boolean;
};

const SandboxBanner = forwardRef<SandboxBannerHandler, SandboxBannerProps>(
  ({ hideOnDesktop }, ref) => {
    return null;
    const containerRef = useRef<HTMLDivElement | null>(null);
    const getHeight = () => containerRef.current?.offsetHeight ?? 0;

    useImperativeHandle(
      ref,
      () => ({
        getHeight,
      }),
      [],
    );

    return (
      <SandboxBannerContainer
        ref={containerRef}
        hideOnDesktop={!!hideOnDesktop}
      >
        <Banner variant="warning">Sandbox Mode</Banner>
      </SandboxBannerContainer>
    );
  },
);

const SandboxBannerContainer = styled.div<{
  hideOnDesktop: boolean;
}>`
  ${({ theme }) => css`
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    position: sticky;
    top: 0;
    z-index: ${theme.zIndex.sticky};
  `};

  ${({ hideOnDesktop }) =>
    !!hideOnDesktop &&
    css`
      ${media.greaterThan('md')`
        display: none;
      `}
    `}
`;

export default SandboxBanner;
