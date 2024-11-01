import { IcoCloseSmall16 } from '@onefootprint/icons';
import type { ListRuleField, RiskSignalRuleField, RiskSignalRuleOp } from '@onefootprint/types';
import { IconButton, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import EditContainer from './components/edit-container';
import ExpressionContainer from './components/expression-container';
import OpSelect from './components/op-select';
import RiskSignalSelect from './components/risk-signal-select';

type RiskSignalRuleChipProps = {
  defaultExpression: RiskSignalRuleField;
  isEditing?: boolean;
  onDelete?: () => void;
  onChange?: (expression: RiskSignalRuleField | ListRuleField) => void;
};

const RiskSignalRuleChip = ({ isEditing, defaultExpression, onDelete, onChange }: RiskSignalRuleChipProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'rules.action-row.rule-chip' });
  const [ruleExpression, setRuleExpression] = useState<RiskSignalRuleField>(defaultExpression);

  useEffect(() => {
    setRuleExpression(defaultExpression);
  }, [defaultExpression]);

  const handleFieldChange = (newField: string) => {
    setRuleExpression(currentExpression => {
      const newExpression = {
        ...currentExpression,
        field: newField,
      };
      onChange?.(newExpression);
      return newExpression;
    });
  };

  const handleOpChange = (newOp: string) => {
    setRuleExpression(currentExpression => {
      const newExpression = {
        ...currentExpression,
        op: newOp as RiskSignalRuleOp,
      };
      onChange?.(newExpression);
      return newExpression;
    });
  };

  return isEditing ? (
    <EditContainer>
      {/* biome-ignore lint/a11y/useSemanticElements: TODO: change to <fieldset /> */}
      <ExpressionContainer role="group" aria-label={ruleExpression.field}>
        <RiskSignalSelect value={ruleExpression.field} onChange={handleFieldChange} />
        <OpSelect defaultOp={ruleExpression.op} onChange={handleOpChange} />
        <Text variant="body-3" color="tertiary">
          {t('risk-signal.value-placeholder')}
        </Text>
      </ExpressionContainer>
      {onDelete && (
        <IconButton aria-label="Delete field" onClick={onDelete} size="compact">
          <IcoCloseSmall16 color="tertiary" className="deleteIcon" />
        </IconButton>
      )}
    </EditContainer>
  ) : (
    // biome-ignore lint/a11y/useSemanticElements: TODO: change to <fieldset />
    <ExpressionContainer role="group" aria-label={ruleExpression.field}>
      <Text variant="body-3" minWidth="fit-content">
        {ruleExpression.field}
      </Text>
      <Text variant="body-3" minWidth="fit-content">
        {t(`op.${ruleExpression.op}` as ParseKeys<'common'>)}
      </Text>
      <Text variant="body-3" color="tertiary">
        {t('risk-signal.value-placeholder')}
      </Text>
    </ExpressionContainer>
  );
};

export default RiskSignalRuleChip;
