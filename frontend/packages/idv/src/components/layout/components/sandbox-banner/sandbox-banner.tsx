import { useTranslation } from '@onefootprint/hooks';
import { Banner } from '@onefootprint/ui';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import styled, { css } from 'styled-components';

export type SandboxBannerHandler = {
  getHeight: () => number;
};

const SandboxBanner = forwardRef<SandboxBannerHandler, {}>((_, ref) => {
  const { t } = useTranslation('components.layout.sandbox-banner');
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
      <Banner variant="warning">{t('title')}</Banner>
    </SandboxBannerContainer>
  );
});

const SandboxBannerContainer = styled.div`
  ${({ theme }) => css`
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    position: sticky;
    top: 0;
    z-index: ${theme.zIndex.sticky};
  `};
`;

export default SandboxBanner;
