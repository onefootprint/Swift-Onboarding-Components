import { useTranslation } from 'hooks';
import React from 'react';
import styled, { css } from 'styled-components';
import { Banner } from 'ui';

import useIsSandbox from '../../hooks/use-is-sandbox';

const SandboxBanner = () => {
  const isSandbox = useIsSandbox();
  const { t } = useTranslation('components.sandbox-banner');

  return isSandbox ? (
    <Container>
      <Banner variant="warning">{t('label')}</Banner>
    </Container>
  ) : null;
};

const Container = styled.div`
  ${({ theme }) => css`
    border-bottom: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};

    > [role='alert'] {
      border-radius: ${theme.borderRadius[2]}px ${theme.borderRadius[2]}px 0 0;
    }
  `};
`;

export default SandboxBanner;
