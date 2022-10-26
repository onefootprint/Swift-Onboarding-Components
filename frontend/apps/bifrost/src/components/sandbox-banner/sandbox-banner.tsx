import { useTranslation } from '@onefootprint/hooks';
import { Banner } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import useSandboxMode from '../../hooks/use-sandbox-mode';

const SandboxBanner = () => {
  const { isSandbox } = useSandboxMode();
  const { t } = useTranslation('components.sandbox-banner');

  return isSandbox ? (
    <Container>
      <Banner variant="warning">{t('label')}</Banner>
    </Container>
  ) : null;
};

const Container = styled.div`
  ${({ theme }) => css`
    position: sticky;
    top: 0;
    z-index: ${theme.zIndex.sticky};
    border-bottom: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};

    > [role='alert'] {
      border-radius: ${theme.borderRadius.default}px
        ${theme.borderRadius.default}px 0 0;
    }
  `};
`;

export default SandboxBanner;
