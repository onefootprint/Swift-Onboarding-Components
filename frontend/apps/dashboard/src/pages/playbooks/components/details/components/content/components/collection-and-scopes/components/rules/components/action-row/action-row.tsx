import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { type Rule, RuleOp } from '@onefootprint/types';
import { Badge, LinkButton, Stack } from '@onefootprint/ui';
import { createFontStyles } from '@onefootprint/ui/src/utils/mixins/mixins';
import React, { useState } from 'react';
import useSession from 'src/hooks/use-session';

import OpBadge from '../op-badge';
import RowEditButtons from '../row-edit-buttons';

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

  const handleSubmitEdit = () => {
    setIsEditing(false);
  };

  return (
    <RulesListItem data-is-editing={isEditing}>
      <div>
        {t('if')}
        {rule.ruleExpression.map(({ field: reasonCode, op }, index) => (
          <React.Fragment key={reasonCode}>
            {index > 0 && t('and')}
            <OpBadge
              isActive={op === RuleOp.notEq}
              isEditable={isEditing}
              onClick={isNotEq => handleToggleOp(index, isNotEq)}
            />
            <Badge variant="info">{reasonCode}</Badge>
          </React.Fragment>
        ))}
      </div>
      {isEditing ? (
        <RowEditButtons
          playbookId={playbookId}
          editedRule={editedRule}
          onCancelClick={handleCancelEdit}
          onSubmitClick={handleSubmitEdit}
        />
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
