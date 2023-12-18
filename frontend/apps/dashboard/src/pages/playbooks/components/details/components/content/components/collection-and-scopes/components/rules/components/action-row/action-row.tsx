import { useTranslation } from '@onefootprint/hooks';
import { IcoPlusSmall16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { type Rule, type RuleField, RuleOp } from '@onefootprint/types';
import { Badge, createFontStyles, LinkButton, Stack } from '@onefootprint/ui';
import React, { useState } from 'react';
import useSession from 'src/hooks/use-session';

import OpBadge from '../op-badge';
import RowEditButtons from '../row-edit-buttons';
import RiskSignalSelect from './components/risk-signal-select';

export type ActionRowProps = {
  playbookId: string;
  rule: Rule;
};

const ActionRow = ({ playbookId, rule }: ActionRowProps) => {
  const { t, allT } = useTranslation(
    'pages.playbooks.details.rules.action-row',
  );
  const isFirmEmployee = useSession().data.user?.isFirmEmployee;
  const [isEditing, setIsEditing] = useState(false);
  const [editedRule, setEditedRule] = useState<Rule>(rule);
  const [expressions, setExpressions] = useState<RuleField[]>(
    rule.ruleExpression,
  );

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleToggleOp = (index: number, isNotEq: boolean) => {
    const newRuleExp = JSON.parse(JSON.stringify(editedRule.ruleExpression));
    newRuleExp[index].op = isNotEq ? RuleOp.notEq : RuleOp.eq;
    setEditedRule({ ...editedRule, ruleExpression: newRuleExp });
  };

  const handleCancelEdit = () => {
    setEditedRule(rule);
    setIsEditing(false);
  };

  const handleAdd = () => {
    const canAdd = !expressions.some(expression => expression.field === '');
    if (!canAdd) return;

    setExpressions(currentExpressions => [
      ...currentExpressions,
      { field: '', op: RuleOp.eq, value: true },
    ]);
  };

  const handleChange = (expression: RuleField) => (nextValue: string) => {
    setExpressions(currentExpressions =>
      currentExpressions.map(currentExpression =>
        currentExpression === expression
          ? { ...currentExpression, field: nextValue }
          : currentExpression,
      ),
    );
    // TODO: Save in the DB
  };

  const handleSubmitEdit = () => {
    setIsEditing(false);
  };

  return (
    <RulesListItem data-is-editing={isEditing}>
      <div>
        {t('if')}
        {expressions.map((expression, index) => (
          <React.Fragment key={expression.field}>
            {index > 0 && t('and')}
            <OpBadge
              isActive={expression.op === RuleOp.notEq}
              isEditable={isEditing}
              onClick={isNotEq => handleToggleOp(index, isNotEq)}
            />
            {expression.field ? (
              <Badge variant="info">{expression.field}</Badge>
            ) : (
              <RiskSignalSelect
                value={expression.field}
                onDelete={() => {}}
                onChange={handleChange(expression)}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      {isEditing ? (
        <Stack gap={7} direction="column" marginTop={3}>
          <LinkButton
            size="xTiny"
            iconComponent={IcoPlusSmall16}
            iconPosition="left"
            onClick={handleAdd}
          >
            {t('add')}
          </LinkButton>
          <RowEditButtons
            playbookId={playbookId}
            editedRule={editedRule}
            onCancel={handleCancelEdit}
            onSubmit={handleSubmitEdit}
          />
        </Stack>
      ) : (
        isFirmEmployee && (
          <LinkButton size="tiny" onClick={handleStartEdit}>
            {allT('edit')}
          </LinkButton>
        )
      )}
    </RulesListItem>
  );
};

const RulesListItem = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    ${createFontStyles('body-4')}
    line-height: 240%;

    &:not(:last-child) {
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }

    &[data-is-editing='false'] {
      align-items: center;
      justify-content: space-between;
    }

    &[data-is-editing='true'] {
      flex-direction: column;
    }
  `}
`;

export default ActionRow;
