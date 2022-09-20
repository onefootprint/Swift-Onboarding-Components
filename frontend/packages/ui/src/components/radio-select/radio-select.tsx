import React, { useState } from 'react';
import styled from 'styled-components';

import RadioSelectOption, {
  RadioSelectOptionFields,
} from './components/radio-select-option';

export type RadioSelectProps = {
  options: RadioSelectOptionFields[];
  defaultSelected?: string;
  onSelect: (value: string) => void;
  testID?: string;
};

const RadioSelect = ({
  options,
  defaultSelected,
  onSelect,
  testID,
}: RadioSelectProps) => {
  const [selectedValue, setSelectedValue] = useState(
    defaultSelected ?? (options.length ? options[0].value : ''),
  );
  if (!options.length) {
    return null;
  }

  return (
    <OptionsContainer data-testid={testID}>
      {options.map(({ title, description, IconComponent, value }) => (
        <RadioSelectOption
          key={value}
          value={value}
          title={title}
          description={description}
          IconComponent={IconComponent}
          onClick={() => {
            setSelectedValue(value);
            onSelect(value);
          }}
          selected={selectedValue === value}
        />
      ))}
    </OptionsContainer>
  );
};

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
`;

export default RadioSelect;
