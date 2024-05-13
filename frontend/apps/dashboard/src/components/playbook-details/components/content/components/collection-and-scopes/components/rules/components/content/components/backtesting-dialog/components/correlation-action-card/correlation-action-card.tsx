import type { FontVariant, UIState } from '@onefootprint/design-tokens';
import { BacktestingRuleAction } from '@onefootprint/types';
import { createFontStyles, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { Trans } from 'react-i18next';
import styled, { css } from 'styled-components';

import getActionText from '../../utils/get-action-text';
import getActionVariant from '../../utils/get-action-variant';

export type CorrelationActionCardProps = {
  sectionAction: BacktestingRuleAction;
  data: Partial<Record<BacktestingRuleAction, number>>;
};

const CorrelationActionCard = ({
  sectionAction,
  data,
}: CorrelationActionCardProps) => {
  const sectionActionValue =
    BacktestingRuleAction[sectionAction as keyof typeof BacktestingRuleAction];
  const rowActions = Object.keys(BacktestingRuleAction).filter(
    rowAction => rowAction !== sectionAction,
  );

  return (
    <Container role="group" aria-label={`${sectionAction} correlation card`}>
      <Text variant="label-4" marginTop={4} marginBottom={5}>
        <Trans
          i18nKey="pages.playbooks.details.rules.backtesting.correlation.action-list"
          components={{
            color: (
              <ActionText
                variant="label-4"
                color={getActionVariant(sectionActionValue)}
              />
            ),
          }}
          values={{ action: getActionText(sectionActionValue) }}
        />
      </Text>
      <ActionRow data-is-last={false} role="row">
        <Text variant="body-3">
          <Trans
            i18nKey="pages.playbooks.details.rules.backtesting.correlation.same"
            components={{
              color: (
                <ActionText
                  variant="body-3"
                  color={getActionVariant(sectionActionValue)}
                />
              ),
            }}
            values={{ action: getActionText(sectionActionValue) }}
          />
        </Text>
        <Text variant="body-3">{data[sectionAction] || 0}</Text>
      </ActionRow>
      {rowActions.map((rowAction, index) => {
        const rowActionValue =
          BacktestingRuleAction[
            rowAction as keyof typeof BacktestingRuleAction
          ];
        return (
          <ActionRow
            key={rowAction}
            data-is-last={index === rowActions.length - 1}
            role="row"
          >
            <Text variant="body-3">
              <Trans
                i18nKey="pages.playbooks.details.rules.backtesting.correlation.changed"
                components={{
                  color: (
                    <ActionText
                      variant="body-3"
                      color={getActionVariant(rowActionValue)}
                    />
                  ),
                }}
                values={{
                  action: getActionText(rowActionValue),
                }}
              />
            </Text>
            <Text variant="body-3">
              {data[rowAction as BacktestingRuleAction] || 0}
            </Text>
          </ActionRow>
        );
      })}
    </Container>
  );
};

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

const ActionText = styled.b<{
  variant: FontVariant;
  color: UIState;
}>`
  ${({ theme, variant, color }) => css`
    ${createFontStyles(variant)};
    color: ${theme.color[color]};
  `}
`;

export default CorrelationActionCard;
