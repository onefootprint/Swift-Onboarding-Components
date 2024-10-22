import { IcoCloseSmall16 } from '@onefootprint/icons';
import type { DataIdentifier, List, ListKind, ListRuleField, RiskSignalRuleField } from '@onefootprint/types';
import { IconButton, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DISelect from './components/di-select';
import EditContainer from './components/edit-container';
import ExpressionContainer from './components/expression-container';
import ListSelect from './components/list-select';
import OpSelect from './components/op-select';
import dataIdentifiersForListKind from './utils/data-identifiers-for-list-kind';
import listKindsForDataIdentifier from './utils/list-kinds-for-data-identifier';

type ListRuleChipProps = {
  defaultExpression: ListRuleField;
  isEditing?: boolean;
  lists?: List[];
  onDelete?: () => void;
  onChange?: (expression: RiskSignalRuleField | ListRuleField) => void;
};

const ListRuleChip = ({ isEditing, defaultExpression, lists = [], onDelete, onChange }: ListRuleChipProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'rules.action-row.rule-chip' });
  const [ruleExpression, setRuleExpression] = useState<ListRuleField>(defaultExpression);
  const [selectedList, setSelectedList] = useState<List | undefined>(
    lists.find(({ id }) => id === ruleExpression.value),
  );

  useEffect(() => {
    setRuleExpression(defaultExpression);
  }, [defaultExpression]);

  useEffect(() => {
    setSelectedList(lists.find(({ id }) => id === defaultExpression.value));
  }, [defaultExpression, lists]);

  const handleListFieldChange = (newField: string) => {
    setRuleExpression(currentExpression => {
      const newExpression = {
        ...currentExpression,
        field: newField as DataIdentifier,
      };

      // If the selected DI is not compatible with the already-selected List, wipe the List
      const isListIdValid =
        !currentExpression.value ||
        (selectedList?.kind && listKindsForDataIdentifier(newField as DataIdentifier).includes(selectedList.kind));
      if (!isListIdValid) {
        newExpression.value = '';
      }

      onChange?.(newExpression);
      return newExpression;
    });
  };

  const handleOpChange = (newOp: string) => {
    setRuleExpression(currentExpression => {
      const newExpression = {
        ...currentExpression,
        op: newOp,
      } as ListRuleField;
      onChange?.(newExpression);
      return newExpression;
    });
  };

  const handleListValueChange = (newListId: string) => {
    setRuleExpression(currentExpression => {
      const newExpression = {
        ...currentExpression,
        value: newListId,
      } as ListRuleField;

      // If the selected List is not compatible with the already-selected DI, wipe the DI
      const isDIValid =
        !currentExpression.field ||
        dataIdentifiersForListKind(selectedList?.kind as ListKind).includes(currentExpression.field);
      if (!isDIValid) {
        newExpression.field = undefined;
      }

      onChange?.(newExpression);
      return newExpression;
    });
  };

  return isEditing ? (
    <EditContainer>
      <ExpressionContainer role="group" aria-label={ruleExpression.field} data-is-editing={isEditing}>
        <DISelect defaultDI={ruleExpression.field} listKind={selectedList?.kind} onChange={handleListFieldChange} />
        <OpSelect defaultOp={ruleExpression.op} onChange={handleOpChange} />
        <Text variant="body-3" color="tertiary">
          {t('list.in')}
        </Text>
        <ListSelect
          defaultList={selectedList}
          di={ruleExpression.field}
          lists={lists}
          onChange={handleListValueChange}
        />
      </ExpressionContainer>
      {onDelete && (
        <IconButton aria-label="Delete field" onClick={onDelete} size="compact">
          <IcoCloseSmall16 color="tertiary" className="deleteIcon" />
        </IconButton>
      )}
    </EditContainer>
  ) : (
    <ExpressionContainer role="group" aria-label={ruleExpression.field}>
      <Text variant="body-3" minWidth="fit-content">
        {ruleExpression.field}
      </Text>
      <Text variant="body-3" minWidth="fit-content">
        {t(`op.${ruleExpression.op}` as ParseKeys<'common'>)}
      </Text>
      <Text variant="body-3" color="tertiary">
        {t('list.in')}
      </Text>
      <Text variant="caption-1" minWidth="fit-content">
        {selectedList?.alias ?? ruleExpression.value}
      </Text>
    </ExpressionContainer>
  );
};

export default ListRuleChip;
