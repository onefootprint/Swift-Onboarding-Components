import { IcoChevronDown16 } from '@onefootprint/icons';
import type { DataIdentifier, ListKind } from '@onefootprint/types';
import { Command, Stack } from '@onefootprint/ui';
import { SelectCustom } from '@onefootprint/ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import dataIdentifiersForListKind from '../../utils/data-identifiers-for-list-kind';

type DISelectProps = {
  defaultDI?: DataIdentifier;
  listKind?: ListKind;
  onChange: (di: string) => void;
};

const DISelect = ({ defaultDI, listKind, onChange }: DISelectProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'rules.action-row.rule-chip.list' });
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const options = useMemo(() => {
    const dataIdentifiers = dataIdentifiersForListKind(listKind);
    return dataIdentifiers.map(di => ({
      value: di,
      label: di,
    }));
  }, [listKind]);

  return (
    <SelectCustom.Root
      defaultValue={defaultDI}
      value={defaultDI}
      onValueChange={onChange}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectCustom.Trigger aria-label={t('field.trigger-aria-label')}>
        <Stack direction="row" align="center" gap={1} cursor="pointer">
          {defaultDI || t('field.placeholder')}
          <Stack
            align="center"
            justify="center"
            transform={open ? 'rotate(180deg)' : undefined}
            transition="transform 0.1s ease-in-out"
          >
            <IcoChevronDown16 />
          </Stack>
        </Stack>
      </SelectCustom.Trigger>
      <SelectCustom.Content sideOffset={4} align="start" popper minWidth="max-content">
        <Command.Root>
          <Command.Input value={inputValue} onValueChange={setInputValue} />
          <Command.List>
            <Command.Empty>{t('field.search-empty')}</Command.Empty>
            <Command.Group>
              {options.map((option: { value: string; label: string }) => (
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

export default DISelect;
