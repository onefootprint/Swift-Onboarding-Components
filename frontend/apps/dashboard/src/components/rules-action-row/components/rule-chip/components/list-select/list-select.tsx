import type { DataIdentifier, List } from '@onefootprint/types';
import { Command } from '@onefootprint/ui';
import { SelectCustom } from '@onefootprint/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import listKindsForDataIdentifier from '../../utils/list-kinds-for-data-identifier';
import BaseTrigger from '../base-trigger';

type ListProps = {
  defaultList?: List;
  di?: DataIdentifier;
  lists?: List[];
  onChange: (id: string) => void;
};

const ListSelect = ({ defaultList, di, lists = [], onChange }: ListProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'rules.action-row.rule-chip.list' });
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const filteredLists = useMemo(
    () => (di ? lists?.filter(({ kind }) => listKindsForDataIdentifier(di).includes(kind)) : lists),
    [di, lists],
  );

  const options = useMemo(
    () =>
      filteredLists.map(list => ({
        id: list.id,
        label: list.alias || list.id,
        value: list.id,
      })),
    [filteredLists],
  );

  return (
    <SelectCustom.Root
      defaultValue={defaultList?.id}
      value={defaultList?.id}
      onValueChange={onChange}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectCustom.Trigger aria-label={t('value.trigger-aria-label')}>
        <BaseTrigger value={defaultList?.alias || defaultList?.id} open={open} placeholder={t('value.placeholder')} />
      </SelectCustom.Trigger>
      <SelectCustom.Content sideOffset={4} align="start" popper minWidth="max-content">
        <Command.Root>
          <Command.Input value={inputValue} onValueChange={setInputValue} size="compact" />
          <Command.List>
            <Command.Empty>{t('value.empty')}</Command.Empty>
            <Command.Group>
              {options.map(option => (
                <Command.Item
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                    setInputValue('');
                  }}
                >
                  {option.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command.Root>
      </SelectCustom.Content>
    </SelectCustom.Root>
  );
};

export default ListSelect;
