import { useTranslation } from '@onefootprint/hooks';
import { Banner } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import useSandboxMode from '../../hooks/use-sandbox-mode';

const SandboxBanner = () => {
  const { isSandbox } = useSandboxMode();
  const { t } = useTranslation('components.sandbox-banner');

  return isSandbox ? (
    <SandboxBannerContainer>
      <Banner variant="warning">{t('label')}</Banner>
    </SandboxBannerContainer>
  ) : null;
};

const SandboxBannerContainer = styled.div`
  ${({ theme }) => css`
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    position: sticky;
    top: 0;
    z-index: ${theme.zIndex.sticky};
  `};
`;

export default SandboxBanner;
