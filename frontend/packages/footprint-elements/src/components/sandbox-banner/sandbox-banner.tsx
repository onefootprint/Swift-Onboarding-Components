import { Banner } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import styled, { css } from 'styled-components';

export type SandboxBannerHandler = {
  getHeight: () => number;
};

type SandboxBannerProps = {
  label?: string;
};

const SandboxBanner = forwardRef<SandboxBannerHandler, SandboxBannerProps>(
  ({ label = 'Sandbox Mode' }, ref) => {
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
      <SandboxBannerContainer ref={containerRef}>
        <Banner variant="warning">{label}</Banner>
      </SandboxBannerContainer>
    );
  },
);

const SandboxBannerContainer = styled.div`
  ${({ theme }) => css`
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    position: sticky;
    top: 0;
    z-index: ${theme.zIndex.sticky};
  `};
`;

export default SandboxBanner;
