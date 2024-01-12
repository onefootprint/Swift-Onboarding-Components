import { useTranslation } from '@onefootprint/hooks';
import { IcoPlusSmall16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { type Rule, type RuleField, RuleOp } from '@onefootprint/types';
import { Badge, createFontStyles, LinkButton, Stack } from '@onefootprint/ui';
import React, { useState } from 'react';

import OpBadge from './components/op-badge';
import RiskSignalSelect from './components/risk-signal-select';
import RowEditButtons from './components/row-edit-buttons';

export type RulesActionRowProps = {
  shouldAllowEditing: boolean;
  playbookId: string;
  rule: Rule;
};

const RulesActionRow = ({
  shouldAllowEditing,
  playbookId,
  rule,
}: RulesActionRowProps) => {
  const { t, allT } = useTranslation(
    'pages.playbooks.details.rules.action-row',
  );
  const [isEditing, setIsEditing] = useState(false);
  const [expressions, setExpressions] = useState<RuleField[]>(
    rule.ruleExpression,
  );

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleEndEdit = () => {
    setIsEditing(false);
  };

  // Using index instead of expression in case the rule has the same expression multiple times
  const handleToggleOp = (index: number) => (newOp: RuleOp) => {
    setExpressions(currentExpressions => {
      const newExpressions = [...currentExpressions];
      newExpressions[index] = { ...newExpressions[index], op: newOp };
      return newExpressions;
    });
  };

  const handleChangeField = (index: number) => (newField: string) => {
    setExpressions(currentExpressions => {
      const newExpressions = [...currentExpressions];
      newExpressions[index] = { ...newExpressions[index], field: newField };
      return newExpressions;
    });
  };

  const handleDeleteField = (index: number) => {
    setExpressions(currentExpressions =>
      currentExpressions
        .slice(0, index)
        .concat(currentExpressions.slice(index + 1)),
    );
  };

  const handleAddField = () => {
    setExpressions(currentExpressions => [
      ...currentExpressions,
      { field: '', op: RuleOp.eq, value: true },
    ]);
  };

  const handleCancelEdit = () => {
    setExpressions(rule.ruleExpression);
    handleEndEdit();
  };

  return (
    <RulesListItem
      data-is-editing={isEditing}
      role="row"
      aria-label={rule.ruleExpression[0].field}
    >
      <div>
        {t('if')}
        {expressions.map((expression, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <React.Fragment key={`${index} ${expression.field}`}>
            {index > 0 && t('and')}
            <OpBadge
              defaultValue={expression.op}
              isEditable={isEditing}
              onClick={handleToggleOp(index)}
            />
            {isEditing ? (
              <RiskSignalSelect
                value={expression.field}
                onDelete={
                  expressions.length > 1
                    ? () => handleDeleteField(index)
                    : undefined
                }
                onChange={handleChangeField(index)}
              />
            ) : (
              <Badge variant="info">{expression.field}</Badge>
            )}
          </React.Fragment>
        ))}
      </div>
      {isEditing ? (
        <Stack gap={7} direction="column">
          <LinkButton
            size="xTiny"
            sx={{ width: 'fit-content' }}
            iconComponent={IcoPlusSmall16}
            iconPosition="left"
            disabled={expressions.some(expression => expression.field === '')}
            onClick={handleAddField}
          >
            {t('add')}
          </LinkButton>
          <RowEditButtons
            playbookId={playbookId}
            editedRule={{
              ...JSON.parse(JSON.stringify(rule)),
              ruleExpression: expressions,
            }}
            onCancel={handleCancelEdit}
            onSubmit={handleEndEdit}
          />
        </Stack>
      ) : (
        shouldAllowEditing && (
          <LinkButton
            size="tiny"
            sx={{ paddingTop: 5, paddingLeft: 3 }}
            onClick={handleStartEdit}
          >
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
      gap: ${theme.spacing[8]};
      justify-content: space-between;
    }

    &[data-is-editing='true'] {
      gap: ${theme.spacing[4]};
      flex-direction: column;
    }
  `}
`;

export default RulesActionRow;
