import { OverallOutcome } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

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
    [OverallOutcome.useRulesOutcome]: t('options.document-decision'),
    [OverallOutcome.stepUp]: t('options.step-up'),
  };
  return sandboxId ? (
    <Container>
      <Inner>
        <Column>
          <Text variant="label-3" color="tertiary">
            {label}
          </Text>
          <Text variant="label-3" color="secondary">
            {sandboxId}
          </Text>
        </Column>
        {overallOutcome ? (
          <Column>
            <Text variant="label-3" color="tertiary">
              {t('label')}
            </Text>
            <Text variant="label-3" color="secondary">
              {outcomeLabels[overallOutcome]}
            </Text>
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
