import { useTranslation } from '@onefootprint/hooks';
import { Banner, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import useSandboxMode from './hooks/use-sandbox-mode';

const SandboxBanner = () => {
  const { isSandbox } = useSandboxMode();
  const { t } = useTranslation('components.layout.sandbox-banner');

  return isSandbox ? (
    <SandboxBannerContainer>
      <Banner variant="warning">{t('title')}</Banner>
    </SandboxBannerContainer>
  ) : null;
};

const SandboxBannerContainer = styled.div`
  ${({ theme }) => css`
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    position: sticky;
    top: 0;
    z-index: ${theme.zIndex.sticky};
    display: none;

    ${media.greaterThan('md')`
      display: block;
    `}
  `};
`;

export default SandboxBanner;
