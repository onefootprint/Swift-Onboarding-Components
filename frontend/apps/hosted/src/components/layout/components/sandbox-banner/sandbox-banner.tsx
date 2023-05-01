import { useTranslation } from '@onefootprint/hooks';
import { Banner, media } from '@onefootprint/ui';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';
import styled, { css } from 'styled-components';

const SandboxBanner = () => {
  const { t } = useTranslation('components.layout.sandbox-banner');
  const [state] = useHostedMachine();
  const { onboardingConfig } = state.context;
  const isSandbox = onboardingConfig?.isLive === false;

  return (
    <SandboxBannerContainer>
      {isSandbox && <Banner variant="warning">{t('title')}</Banner>}
    </SandboxBannerContainer>
  );
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
