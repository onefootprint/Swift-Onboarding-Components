import { useTranslation } from '@onefootprint/hooks';
import { Banner, Box, Tooltip } from '@onefootprint/ui';
import React from 'react';
import useSandboxMode from 'src/hooks/use-sandbox-mode';
import styled, { css } from 'styled-components';

const SandboxBanner = () => {
  const { t } = useTranslation('components.private-layout.sandbox-banner');
  const { isSandbox, toggle, canToggle } = useSandboxMode();

  return isSandbox ? (
    <SandboxBannerContainer>
      <Banner variant="warning">
        {t('title')}
        <Tooltip disabled={canToggle} size="compact" text={t('tooltip')}>
          <Box as="span">
            <button type="button" onClick={toggle} disabled={!canToggle}>
              {t('disable')}
            </button>
          </Box>
        </Tooltip>
      </Banner>
    </SandboxBannerContainer>
  ) : null;
};

const SandboxBannerContainer = styled.div`
  ${({ theme }) => css`
    border-bottom: 1px solid ${theme.borderColor.tertiary};

    button {
      padding: 0;
      margin-left: ${theme.spacing[2]}px;

      &:disabled {
        cursor: default;
        opacity: 0.7;
      }
    }
  `};
`;

export default SandboxBanner;
