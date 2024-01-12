import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Banner, media } from '@onefootprint/ui';
import React from 'react';
import useHostedMachine from 'src/hooks/use-hosted-machine';

const SandboxBanner = () => {
  const { t } = useTranslation('components.layout');
  const [state] = useHostedMachine();
  const { onboardingConfig } = state.context;
  const isSandbox = onboardingConfig?.isLive === false;

  return (
    <SandboxBannerContainer>
      {isSandbox && <Banner variant="warning">{t('sandbox-banner')}</Banner>}
    </SandboxBannerContainer>
  );
};

const SandboxBannerContainer = styled.div`
  ${({ theme }) => css`
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: none;

    ${media.greaterThan('md')`
      display: block;
    `}
  `};
`;

export default SandboxBanner;
