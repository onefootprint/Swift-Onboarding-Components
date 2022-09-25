import { COUNTRIES } from '@onefootprint/global-constants';
import React from 'react';
import styled, { css } from 'styled-components';
import type { CountryCode } from 'types';

import BaseSelect, {
  BaseSelectOption,
  BaseSelectProps,
} from '../internal/base-select';
import BaseSelectTrigger from '../internal/base-select-trigger';
import Flag from '../internal/flag';
import Option from './components/option';
import { CountrySelectOption } from './country-select.types';

export type CountrySelectProps = Omit<
  BaseSelectProps<CountrySelectOption>,
  'options' | 'renderTrigger'
> & {
  options?: CountrySelectOption[];
  placeholder?: string;
};

const CountrySelect = ({
  disabled,
  emptyStateText,
  hasError,
  hint,
  id,
  label,
  name,
  onBlur,
  onChange,
  options = COUNTRIES,
  placeholder = 'Select',
  testID,
  value,
}: CountrySelectProps) => (
  <BaseSelect<BaseSelectOption<CountryCode>>
    disabled={disabled}
    emptyStateText={emptyStateText}
    hasError={hasError}
    hint={hint}
    id={id}
    label={label}
    name={name}
    onBlur={onBlur}
    onChange={onChange}
    OptionComponent={Option}
    options={options}
    testID={testID}
    value={value}
    renderTrigger={({ isOpen, selectedOption, onClick, ref }) => (
      <BaseSelectTrigger
        disabled={disabled}
        hasError={hasError}
        hasFocus={isOpen}
        onClick={onClick}
        ref={ref}
      >
        {selectedOption && <StyledFlag code={selectedOption.value} />}
        {selectedOption?.label || placeholder}
      </BaseSelectTrigger>
    )}
  />
);

const StyledFlag = styled(Flag)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[4]}px;
  `}
`;

export default CountrySelect;
