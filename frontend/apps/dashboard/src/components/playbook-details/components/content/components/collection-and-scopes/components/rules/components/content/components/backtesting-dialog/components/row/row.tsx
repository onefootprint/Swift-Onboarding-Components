import {
  type BacktestedOnboarding,
  BacktestingRuleAction,
  type EntityStatus,
} from '@onefootprint/types';
import { Badge, CodeInline } from '@onefootprint/ui';
import React from 'react';
import { StatusBadge } from 'src/components';

import getActionText from '../../utils/get-action-text';
import getActionVariant from '../../utils/get-action-variant/get-action-variant';

export type RowProps = {
  onboarding: BacktestedOnboarding;
};

const Row = ({ onboarding }: RowProps) => {
  const {
    fpId,
    currentStatus,
    historicalActionTriggered,
    backtestActionTriggered,
  } = onboarding;

  const stepUpActions = [
    'step_up.identity_proof_of_ssn',
    'step_up.proof_of_address',
    'step_up.identity',
  ];
  let historicalAction = historicalActionTriggered
    ? (historicalActionTriggered as unknown as BacktestingRuleAction)
    : BacktestingRuleAction.pass;
  if (stepUpActions.includes(historicalAction)) {
    historicalAction = BacktestingRuleAction.stepUp;
  }
  let backtestAction = backtestActionTriggered
    ? (backtestActionTriggered as unknown as BacktestingRuleAction)
    : BacktestingRuleAction.pass;
  if (stepUpActions.includes(backtestAction)) {
    backtestAction = BacktestingRuleAction.stepUp;
  }

  return (
    <>
      <td>
        <CodeInline isPrivate truncate>
          {fpId}
        </CodeInline>
      </td>
      <td aria-label="status badge">
        <StatusBadge status={currentStatus as unknown as EntityStatus} />
      </td>
      <td>
        <Badge variant={getActionVariant(historicalAction)}>
          {getActionText(historicalAction)}
        </Badge>
      </td>
      <td>
        <Badge variant={getActionVariant(backtestAction)}>
          {getActionText(backtestAction)}
        </Badge>
      </td>
    </>
  );
};

export default Row;
