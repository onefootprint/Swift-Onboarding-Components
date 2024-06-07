import { BacktestingRuleAction, RuleActionSection } from '@onefootprint/types';
import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import getActionText from '../../utils/get-action-text';
import getActionVariant from '../../utils/get-action-variant';

export type ActionCardProps = {
  data: Partial<Record<BacktestingRuleAction, number>>;
  numTotal: number;
};

const ActionCard = ({ data, numTotal }: ActionCardProps) => (
  <Container>
    {Object.keys(BacktestingRuleAction).map((action, index) => {
      const value = BacktestingRuleAction[action as keyof typeof BacktestingRuleAction];
      const count = data[action as BacktestingRuleAction] || 0;
      return (
        <ActionRow
          key={action}
          data-is-last={index === Object.keys(RuleActionSection).length}
          role="row"
          aria-label={action}
        >
          <Text variant="body-3" color={getActionVariant(value)}>
            {getActionText(value)}
          </Text>
          {numTotal && <Text variant="body-3">{`${count} (${Math.round((count / numTotal) * 100)}%)`}</Text>}
        </ActionRow>
      );
    })}
  </Container>
);

const Container = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    padding: ${theme.spacing[2]} ${theme.spacing[5]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

const ActionRow = styled(Stack)`
  ${({ theme }) => css`
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing[3]} 0 ${theme.spacing[3]} 0;

    &[data-is-last='false'] {
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

export default ActionCard;
