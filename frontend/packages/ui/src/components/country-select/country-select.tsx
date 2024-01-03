import { COUNTRIES } from '@onefootprint/global-constants';
import styled, { css } from '@onefootprint/styled';
import type { CountryCode, SupportedLocale } from '@onefootprint/types';
import React from 'react';

import { getCountryCodeFromLocale } from '../../utils';
import Flag from '../flag';
import type {
  BaseSelectOption,
  BaseSelectProps,
} from '../internal/base-select';
import BaseSelect from '../internal/base-select';
import BaseSelectTrigger from '../internal/base-select-trigger';
import Option from './components/option';
import type { CountrySelectOption } from './country-select.types';

export type CountrySelectProps = Omit<
  BaseSelectProps<CountrySelectOption>,
  'options' | 'renderTrigger'
> & {
  locale?: SupportedLocale;
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
  locale,
  name,
  onBlur,
  onChange,
  options = COUNTRIES,
  placeholder = 'Select',
  size = 'default',
  testID,
  value,
}: CountrySelectProps) => {
  const localeCountry = getCountryCodeFromLocale(locale);
  const currentValue =
    !value && locale ? options.find(o => o.value === localeCountry) : value;

  return (
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
      renderTrigger={({
        isOpen,
        onClick,
        selectedOption,
        testID: triggerTestID,
      }) => (
        <BaseSelectTrigger
          disabled={disabled}
          hasError={hasError}
          hasFocus={isOpen}
          isPrivate
          onClick={onClick}
          size={size}
          testID={triggerTestID}
          hasIcon
        >
          {selectedOption?.value && (
            <StyledFlag code={selectedOption.value} disabled={disabled} />
          )}
          <LabelContainer>
            {selectedOption?.label || placeholder}
          </LabelContainer>
        </BaseSelectTrigger>
      )}
      size={size}
      testID={testID}
      value={currentValue}
    />
  );
};

const LabelContainer = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const StyledFlag = styled(Flag)<{ disabled?: boolean }>`
  ${({ theme, disabled }) => css`
    margin-right: ${theme.spacing[4]};
    min-width: 20px;

    ${disabled &&
    css`
      opacity: 0.4;
    `};
  `}
`;

export default CountrySelect;
