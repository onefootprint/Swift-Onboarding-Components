'use client';

import { PHONE_COUNTRIES, REGION_CODES } from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';
import type { ParseKeys } from 'i18next';
import { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import mergeRefs from 'react-merge-refs';
import { useUpdateEffect } from 'usehooks-ts';

import { getCountryCodeFromLocale } from '../../utils';
import type { BaseSelectOption } from '../internal/base-select';
import BaseSelect from '../internal/base-select';
import Input from './components/input';
import MobileOption from './components/mobile-option';
import Option from './components/option';
import type { PhoneInputProps, PhoneSelectOption } from './phone-input.types';
import { getCountryFromPhoneNumber } from './phone-input.utils';

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      hasError,
      hint,
      onReset,
      searchPlaceholder,
      selectEmptyStateText,
      value,
      locale,
      options = PHONE_COUNTRIES,
      ...props
    }: PhoneInputProps,
    ref,
  ) => {
    const { t } = useTranslation('ui');
    const localRef = useRef<HTMLInputElement>(null);
    const [selectedCountry, setCountry] = useState<PhoneSelectOption>(() =>
      getCountryFromPhoneNumber(value, getCountryCodeFromLocale(locale)),
    );

    const countryCode = selectedCountry.value;
    const handleCountryChange = (newOption: PhoneSelectOption) => {
      setCountry(newOption);
      onReset?.();
    };

    useUpdateEffect(() => {
      localRef.current?.focus();
    }, [countryCode]);

    const getCountriesWithLocalizedLabels = () =>
      options.map(option => ({
        ...option,
        label: t(`global.countries.${option.value}` as ParseKeys<'ui'>),
      }));

    const localizedOptions = getCountriesWithLocalizedLabels();

    return (
      <BaseSelect<BaseSelectOption<CountryCode>>
        emptyStateText={selectEmptyStateText}
        hasError={hasError}
        hint={hint}
        onChange={handleCountryChange}
        OptionComponent={Option}
        options={localizedOptions}
        MobileOptionComponent={MobileOption}
        renderTrigger={trigger => (
          <Input
            {...props}
            countryCode={countryCode}
            hasError={hasError}
            prefix={REGION_CODES[countryCode]}
            ref={mergeRefs([ref, localRef])}
            value={value}
            selectTrigger={{
              isOpen: trigger.isOpen,
              onClick: trigger.onClick,
            }}
          />
        )}
        searchPlaceholder={searchPlaceholder}
        value={selectedCountry}
      />
    );
  },
);

export default PhoneInput;
