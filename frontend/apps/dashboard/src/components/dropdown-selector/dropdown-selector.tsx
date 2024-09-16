import { Dropdown, Stack, Text } from '@onefootprint/ui';
import type React from 'react';
import { useState } from 'react';
import styled from 'styled-components';

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
        <Dropdown.Content maxWidth="240px" align="center">
          <Dropdown.RadioGroup value={value.id}>
            {options?.map(option => (
              <Dropdown.RadioItem
                value={option.id}
                textValue={option.name}
                key={option.id}
                height="fit-content"
                onSelect={() => handleSelect(option)}
              >
                <Stack direction="column" gap={1} maxWidth="100%" paddingTop={2} paddingBottom={2}>
                  <Name variant="body-3">{option.name}</Name>
                </Stack>
              </Dropdown.RadioItem>
            ))}
          </Dropdown.RadioGroup>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};

// cap role name at 2 lines
const Name = styled(Text)`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default DropdownSelector;
