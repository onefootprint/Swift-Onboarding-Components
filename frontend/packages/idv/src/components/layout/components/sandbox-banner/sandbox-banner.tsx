import { Banner, media } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type SandboxBannerHandler = {
  getHeight: () => number;
};

type SandboxBannerProps = {
  hideOnDesktop?: boolean;
};

const SandboxBanner = forwardRef<SandboxBannerHandler, SandboxBannerProps>(({ hideOnDesktop }, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const getHeight = () => containerRef.current?.clientHeight ?? 0;
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.layout',
  });

  useImperativeHandle(
    ref,
    () => ({
      getHeight,
    }),
    [],
  );

  return (
    <SandboxBannerContainer ref={containerRef} $hideOnDesktop={!!hideOnDesktop} data-testid="sandbox-banner">
      <Banner variant="warning">{t('sandbox-banner')}</Banner>
    </SandboxBannerContainer>
  );
});

const SandboxBannerContainer = styled.div<{
  $hideOnDesktop: boolean;
}>`
  ${({ theme }) => css`
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    position: sticky;
    top: 0;
    z-index: ${theme.zIndex.sticky};
  `};

  ${({ $hideOnDesktop }) =>
    !!$hideOnDesktop &&
    css`
      ${media.greaterThan('md')`
        display: none;
      `}
    `}
`;

export default SandboxBanner;
