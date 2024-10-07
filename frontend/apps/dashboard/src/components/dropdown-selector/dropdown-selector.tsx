import { SelectCustom, Text } from '@onefootprint/ui';
import type React from 'react';

export type Option<T> = {
  id: string;
  name: string;
  customData?: T;
};

export type DropdownSelectorProps<T> = {
  onValueChange: (value: string) => void;
  triggerAriaLabel: string;
  value: Option<T>;
  options?: Option<T>[];
  renderCustomData?: (option: Option<T>) => React.ReactNode;
};

const DropdownSelector = <T,>({ onValueChange, triggerAriaLabel, value, options }: DropdownSelectorProps<T>) => {
  return (
    <SelectCustom.Root value={value.id} onValueChange={onValueChange}>
      <SelectCustom.Trigger aria-label={triggerAriaLabel}>
        <SelectCustom.Value placeholder="Select">{value.name}</SelectCustom.Value>
        <SelectCustom.ChevronIcon />
      </SelectCustom.Trigger>
      <SelectCustom.Content>
        <SelectCustom.Group>
          {options?.map(option => (
            <SelectCustom.Item key={option.id} value={option.id} asChild showChecked>
              <Text variant="body-3" truncate>
                {option.name}
              </Text>
            </SelectCustom.Item>
          ))}
        </SelectCustom.Group>
      </SelectCustom.Content>
    </SelectCustom.Root>
  );
};

export default DropdownSelector;
