import { Dropdown } from '@onefootprint/ui';
import type React from 'react';
import { useState } from 'react';

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

const DropdownSelector = <T,>({
  onValueChange,
  triggerAriaLabel,
  value,
  options,
  renderCustomData,
}: DropdownSelectorProps<T>) => {
  const [activeOption, setActiveOption] = useState<Option<T> | null>(value);
  const handleSelect = (option: Option<T>) => {
    onValueChange(option.id);
    setActiveOption(option);
  };

  return (
    <Dropdown.Root>
      <Dropdown.Trigger aria-label={triggerAriaLabel} variant="chevron">
        {activeOption?.name || 'Select'}
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content width="320px">
          <Dropdown.Group>
            {options?.map(option => (
              <Dropdown.Item
                height="fit-content"
                checked={value.id === option.id}
                textValue={option.name}
                key={option.id}
                onSelect={() => handleSelect(option)}
              >
                {option.name}
                {renderCustomData?.(option)}
              </Dropdown.Item>
            ))}
          </Dropdown.Group>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};

export default DropdownSelector;
