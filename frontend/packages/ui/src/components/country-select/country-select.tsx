import { COUNTRIES } from '@onefootprint/global-constants';
import styled, { css } from '@onefootprint/styled';
import type { CountryCode } from '@onefootprint/types';
import React from 'react';

import Flag from '../flag';
import BaseSelect, {
  BaseSelectOption,
  BaseSelectProps,
} from '../internal/base-select';
import BaseSelectTrigger from '../internal/base-select-trigger';
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
    renderTrigger={({
      isOpen,
      selectedOption,
      onClick,
      testID: triggerTestID,
    }) => (
      <BaseSelectTrigger
        disabled={disabled}
        hasError={hasError}
        hasFocus={isOpen}
        isPrivate
        onClick={onClick}
        testID={triggerTestID}
      >
        {selectedOption && <StyledFlag code={selectedOption.value} />}
        <LabelContainer>{selectedOption?.label || placeholder}</LabelContainer>
      </BaseSelectTrigger>
    )}
  />
);

const LabelContainer = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const StyledFlag = styled(Flag)`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[4]};
    min-width: 20px;
  `}
`;

export default CountrySelect;
