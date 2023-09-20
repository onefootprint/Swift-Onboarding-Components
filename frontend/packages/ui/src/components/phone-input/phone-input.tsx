import { COUNTRIES, REGION_CODES } from '@onefootprint/global-constants';
import type { CountryCode } from '@onefootprint/types';
import React, { forwardRef, useRef, useState } from 'react';
import mergeRefs from 'react-merge-refs';
import { useUpdateEffect } from 'usehooks-ts';

import type { BaseSelectOption } from '../internal/base-select';
import BaseSelect from '../internal/base-select';
import Input from './components/input';
import Option from './components/option';
import type { PhoneInputProps, PhoneSelectOption } from './phone-input.types';
import { detectCountry } from './phone-input.utils';

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      hasError,
      hint,
      onReset,
      searchPlaceholder,
      selectEmptyStateText,
      value,
      ...props
    }: PhoneInputProps,
    ref,
  ) => {
    const localRef = useRef<HTMLInputElement>(null);
    const [selectedCountry, setCountry] = useState<PhoneSelectOption>(
      detectCountry(value),
    );
    const countryCode = selectedCountry.value;

    const handleCountryChange = (newOption: PhoneSelectOption) => {
      setCountry(newOption);
      onReset?.();
    };

    useUpdateEffect(() => {
      localRef.current?.focus();
    }, [countryCode]);

    return (
      <BaseSelect<BaseSelectOption<CountryCode>>
        emptyStateText={selectEmptyStateText}
        hasError={hasError}
        hint={hint}
        onChange={handleCountryChange}
        OptionComponent={Option}
        options={COUNTRIES}
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
