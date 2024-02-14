import styled, { css } from '@onefootprint/styled';
import { OverallOutcome } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type ContentProps = {
  label: string;
  sandboxId?: string;
  overallOutcome?: OverallOutcome;
};

const Content = ({ label, sandboxId, overallOutcome }: ContentProps) => {
  const { t } = useTranslation('identify', {
    keyPrefix: 'sandbox.outcome',
  });
  const outcomeLabels: Record<OverallOutcome, string> = {
    [OverallOutcome.success]: t('options.success'),
    [OverallOutcome.manualReview]: t('options.manual-review'),
    [OverallOutcome.fail]: t('options.fail'),
    [OverallOutcome.documentDecision]: t('options.document-decision'),
    [OverallOutcome.stepUp]: t('options.step-up'),
  };
  return sandboxId ? (
    <Container>
      <Inner>
        <Column>
          <Typography variant="label-4" color="tertiary">
            {label}
          </Typography>
          <Typography variant="label-4" color="secondary">
            {sandboxId}
          </Typography>
        </Column>
        {overallOutcome ? (
          <Column>
            <Typography variant="label-4" color="tertiary">
              {t('label')}
            </Typography>
            <Typography variant="label-4" color="secondary">
              {outcomeLabels[overallOutcome]}
            </Typography>
          </Column>
        ) : (
          <Column />
        )}
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

export default Content;
