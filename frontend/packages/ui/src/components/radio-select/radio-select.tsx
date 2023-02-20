import React from 'react';
import styled from 'styled-components';

import RadioSelectOption, {
  RadioSelectOptionFields,
} from './components/radio-select-option';

export type RadioSelectProps = {
  options: RadioSelectOptionFields[];
  value?: string;
  onChange: (value: string) => void;
  testID?: string;
};

const RadioSelect = ({ options, value, onChange, testID }: RadioSelectProps) =>
  options.length > 0 ? (
    <OptionsContainer data-testid={testID}>
      {options.map(
        ({ title, description, IconComponent, value: optionValue }) => (
          <RadioSelectOption
            key={optionValue}
            value={optionValue}
            title={title}
            description={description}
            IconComponent={IconComponent}
            onClick={() => {
              onChange(optionValue);
            }}
            selected={optionValue === value}
          />
        ),
      )}
    </OptionsContainer>
  ) : null;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
`;

export default RadioSelect;
