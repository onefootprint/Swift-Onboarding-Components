import styled, { css } from '@onefootprint/styled';
import React from 'react';

import OutcomeSelectOption, {
  OutcomeOptionFields,
} from './components/outcome-select-option';

export type OutcomeSelectProps = {
  options: OutcomeOptionFields[];
  value?: string;
  onChange?: (value: string) => void;
  testID?: string;
  disabled?: boolean;
};

const OutcomeSelect = ({
  options,
  value,
  onChange,
  testID,
  disabled,
}: OutcomeSelectProps) =>
  options.length > 0 ? (
    <OptionsContainer data-testid={testID}>
      {options.map(({ title, value: optionValue }) => (
        <OutcomeSelectOption
          key={optionValue}
          value={optionValue}
          title={title}
          onClick={() => {
            onChange?.(optionValue);
          }}
          selected={optionValue === value}
          disabled={disabled}
        />
      ))}
    </OptionsContainer>
  ) : null;

const OptionsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};

    > * {
      flex: 1 1 0px;
    }
  `}
`;

export default OutcomeSelect;
