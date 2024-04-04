import { IcoPlusSmall16, IcoTrash16 } from '@onefootprint/icons';
import type { RuleAction, RuleField } from '@onefootprint/types';
import { RuleOp } from '@onefootprint/types';
import { IconButton, LinkButton, Stack } from '@onefootprint/ui';
import { createFontStyles } from '@onefootprint/ui/src/utils/mixins/mixins';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import OpBadge from 'src/components/rules-action-row/components/op-badge';
import RiskSignalSelect from 'src/components/rules-action-row/components/risk-signal-select';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import type { AddedRuleWithId } from '../content';

export type EmptyActionRowProps = {
  action: RuleAction;
  tempId: string;
  onEdit: (rule: AddedRuleWithId) => void;
  onDelete: (id: string) => void;
};

const EmptyActionRow = ({
  action,
  tempId,
  onEdit,
  onDelete,
}: EmptyActionRowProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.rules.action-row',
  });
  const emptyExpressions = [
    {
      field: '',
      op: RuleOp.eq,
      value: true,
    } as RuleField,
  ];
  const [expressions, setExpressions] = useState(emptyExpressions);

  const ref = useRef<HTMLDivElement>(null);
  useEffectOnce(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  const handleChange = (newExpression: RuleField[]) => {
    onEdit({
      ruleAction: action,
      ruleExpression: newExpression[newExpression.length - 1].field // Remove empty trailing fields
        ? newExpression
        : newExpression.slice(0, -1),
      tempId,
    });
  };

  // Using index instead of expression in case the rule has the same expression multiple times
  const handleToggleOp = (index: number) => (newOp: RuleOp) => {
    setExpressions(currentExpressions => {
      const newExpressions = [...currentExpressions];
      newExpressions[index] = { ...newExpressions[index], op: newOp };
      handleChange(newExpressions);
      return newExpressions;
    });
  };

  const handleChangeField = (index: number) => (newField: string) => {
    setExpressions(currentExpressions => {
      const newExpressions = [...currentExpressions];
      newExpressions[index] = { ...newExpressions[index], field: newField };
      handleChange(newExpressions);
      return newExpressions;
    });
  };

  const handleDeleteField = (index: number) => {
    setExpressions(currentExpressions => {
      const newExpressions = currentExpressions
        .slice(0, index)
        .concat(currentExpressions.slice(index + 1));
      handleChange(newExpressions);
      return newExpressions;
    });
  };

  const handleAddField = () => {
    setExpressions(currentExpressions => {
      const newExpressions = [
        ...currentExpressions,
        { field: '', op: RuleOp.eq, value: true },
      ];
      handleChange(newExpressions);
      return newExpressions;
    });
  };

  return (
    <RulesListEmptyItem ref={ref} role="row" aria-label={t('empty-aria-label')}>
      <Stack justify="space-between" align="start">
        <div>
          {t('if')}
          {expressions.map(({ field, op }, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <React.Fragment key={`${index} ${field}`}>
              {index > 0 && t('and')}
              <OpBadge
                defaultValue={op}
                isEditable
                onClick={handleToggleOp(index)}
              />
              <RiskSignalSelect
                value={field}
                onDelete={
                  expressions.length > 1
                    ? () => handleDeleteField(index)
                    : undefined
                }
                onChange={handleChangeField(index)}
              />
            </React.Fragment>
          ))}
        </div>
        <div>
          <IconButton aria-label="delete" onClick={() => onDelete(tempId)}>
            <IcoTrash16 color="error" />
          </IconButton>
        </div>
      </Stack>
      <Stack direction="column" gap={7}>
        <LinkButton
          variant="label-4"
          iconComponent={IcoPlusSmall16}
          iconPosition="left"
          disabled={expressions.some(expression => expression.field === '')}
          onClick={handleAddField}
        >
          {t('add')}
        </LinkButton>
      </Stack>
    </RulesListEmptyItem>
  );
};

const RulesListEmptyItem = styled(Stack)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[4]};
    padding: ${theme.spacing[3]} ${theme.spacing[4]} ${theme.spacing[4]}
      ${theme.spacing[4]};
    ${createFontStyles('body-4')}
    line-height: 240%;

    &:not(:last-child) {
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

export default EmptyActionRow;
