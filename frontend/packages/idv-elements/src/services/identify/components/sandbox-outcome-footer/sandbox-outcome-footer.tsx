import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import parseSuffix from './utils/parse-suffix';

type SandboxOutcomeFooterProps = {
  sandboxId?: string;
};

const SandboxOutcomeFooter = ({ sandboxId }: SandboxOutcomeFooterProps) => {
  const { t } = useTranslation('components.sandbox-outcome-footer');

  return sandboxId ? (
    <Container>
      <Inner>
        <Column>
          <Typography variant="label-4" color="tertiary">
            {t('outcome')}
          </Typography>
          <Typography variant="label-4" color="secondary">
            {parseSuffix(sandboxId).outcome}
          </Typography>
        </Column>
        <Column>
          <Typography variant="label-4" color="tertiary">
            {t('testID')}
          </Typography>
          <Typography variant="label-4" color="secondary">
            {parseSuffix(sandboxId).testID}
          </Typography>
        </Column>
      </Inner>
    </Container>
  ) : null;
};

const Container = styled.footer`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[7]};
  `}
`;

const Inner = styled.div`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    bottom: 0;
    display: flex;
    justify-content: space-between;
    left: 0;
    padding: ${theme.spacing[2]} ${theme.spacing[5]};
    position: absolute;
    width: 100%;
  `}
`;

const Column = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    justify-content: space-between;
  `}
`;

export default SandboxOutcomeFooter;
