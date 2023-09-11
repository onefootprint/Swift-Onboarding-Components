import styled, { css } from '@onefootprint/styled';
import React from 'react';
import media from 'styled-media-query';

import type { RadioSelectOptionFields } from './components/radio-select-option';
import RadioSelectOption from './components/radio-select-option';

export type RadioSelectProps = {
  options: RadioSelectOptionFields[];
  value?: string;
  onChange?: (value: string) => void;
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
              onChange?.(optionValue);
            }}
            selected={optionValue === value}
          />
        ),
      )}
    </OptionsContainer>
  ) : null;

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    text-align: left;
    gap: ${theme.spacing[3]};

    ${media.greaterThan(`medium`)`
      gap: ${theme.spacing[3]};
    `}
  `}
`;

export default RadioSelect;
