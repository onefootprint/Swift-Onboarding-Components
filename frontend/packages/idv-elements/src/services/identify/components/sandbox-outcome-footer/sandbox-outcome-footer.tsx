import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { OverallOutcome } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type SandboxOutcomeFooterProps = {
  sandboxId?: string;
  overallOutcome?: OverallOutcome;
};

const SandboxOutcomeFooter = ({
  sandboxId,
  overallOutcome = OverallOutcome.success,
}: SandboxOutcomeFooterProps) => {
  const { t } = useTranslation('components.sandbox-outcome-footer');
  const outcomeLabels: Record<OverallOutcome, string> = {
    [OverallOutcome.success]: t('outcome.options.success'),
    [OverallOutcome.manualReview]: t('outcome.options.manual-review'),
    [OverallOutcome.fail]: t('outcome.options.fail'),
    [OverallOutcome.documentDecision]: t('outcome.options.document-decision'),
  };

  return sandboxId ? (
    <Container>
      <Inner>
        <Column>
          <Typography variant="label-4" color="tertiary">
            {t('outcome.label')}
          </Typography>
          <Typography variant="label-4" color="secondary">
            {outcomeLabels[overallOutcome]}
          </Typography>
        </Column>
        <Column>
          <Typography variant="label-4" color="tertiary">
            {t('testID')}
          </Typography>
          <Typography variant="label-4" color="secondary">
            {sandboxId}
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
