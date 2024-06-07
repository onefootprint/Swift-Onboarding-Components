import { COUNTRIES } from '@onefootprint/global-constants';
import type { CountryCode, SupportedLocale } from '@onefootprint/types';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { getCountryCodeFromLocale } from '../../utils';
import Flag from '../flag';
import type { BaseSelectOption, BaseSelectProps } from '../internal/base-select';
import BaseSelect from '../internal/base-select';
import BaseSelectTrigger from '../internal/base-select-trigger';
import MobileOption from './components/mobile-option';
import Option from './components/option';
import type { CountrySelectOption } from './country-select.types';

export type CountrySelectProps = Omit<BaseSelectProps<CountrySelectOption>, 'options' | 'renderTrigger'> & {
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
  placeholder,
  size = 'default',
  testID,
  value,
}: CountrySelectProps) => {
  const { t } = useTranslation('ui');
  const localeCountry = getCountryCodeFromLocale(locale);

  const getCountriesWithLocalizedLabels = () =>
    options.map(option => ({
      ...option,
      label: t(`global.countries.${option.value}` as ParseKeys<'ui'>),
    }));

  const localizedOptions = getCountriesWithLocalizedLabels();

  const currentValue = !value && locale ? localizedOptions.find(o => o.value === localeCountry) : value;
  const placeholderText = placeholder ?? t('components.country-select.placeholder-default');

  const getLocalizedOption = (countryCode?: CountryCode) =>
    countryCode ? localizedOptions.find(o => o.value === countryCode) : null;

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
      MobileOptionComponent={MobileOption}
      options={localizedOptions}
      renderTrigger={({ isOpen, onClick, selectedOption, testID: triggerTestID }) => {
        const localizedOption = getLocalizedOption(selectedOption?.value);

        return (
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
            {localizedOption?.value && <StyledFlag code={localizedOption.value} disabled={disabled} />}
            <LabelContainer>{localizedOption?.label ?? placeholderText}</LabelContainer>
          </BaseSelectTrigger>
        );
      }}
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

    ${
      disabled &&
      css`
      opacity: 0.4;
    `
    };
  `}
`;

export default CountrySelect;
