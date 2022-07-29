import { COUNTRIES, REGION_CODES } from 'global-constants';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import mergeRefs from 'react-merge-refs';
import type { CountryCode } from 'types';

import BaseSelect, { BaseSelectOption } from '../internal/base-select';
import Input from './components/input';
import Option from './components/option';
import useInputMask from './hooks/use-input-mask';
import type { PhoneInputProps, PhoneSelectOption } from './phone-input.types';
import { getCountryByNumber } from './phone-input.utils';

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      disableMask,
      hasError,
      hintText,
      onReset,
      searchPlaceholder,
      selectEmptyStateText,
      value,
      ...props
    }: PhoneInputProps,
    ref,
  ) => {
    const localRef = useRef<HTMLInputElement>(null);
    const [selectedCountry, setCountry] = useState<PhoneSelectOption>(() =>
      getCountryByNumber(value),
    );
    const countryCode = selectedCountry.value;
    const { isLoading, masks } = useInputMask(countryCode);
    const masksCount = Object.keys(masks).length;

    const handleCountryChange = (newOption: PhoneSelectOption) => {
      setCountry(newOption);
    };

    useEffect(() => {
      if (!isLoading && masksCount > 1) {
        if (localRef.current) {
          localRef.current.focus();
          onReset?.();
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, masksCount]);

    return (
      <BaseSelect<BaseSelectOption<CountryCode>>
        emptyStateText={selectEmptyStateText}
        onChange={handleCountryChange}
        OptionComponent={Option}
        options={COUNTRIES}
        hintText={hintText}
        hasError={hasError}
        searchPlaceholder={searchPlaceholder}
        value={selectedCountry}
        renderTrigger={trigger =>
          // This is a bit hacky, but was the only way to get the mask updating when the
          // country changes, given some limitations on the cleave.js package
          isLoading ? (
            <div>
              <Input
                {...props}
                countryCode={countryCode}
                hasMask={disableMask ? undefined : masks[countryCode]}
                prefix={REGION_CODES[countryCode]}
                ref={mergeRefs([ref, localRef])}
                hasError={hasError}
                value={value}
                selectTrigger={{
                  ref: trigger.ref,
                }}
              />
            </div>
          ) : (
            <Input
              {...props}
              countryCode={countryCode}
              hasMask={disableMask ? undefined : masks[countryCode]}
              prefix={REGION_CODES[countryCode]}
              ref={mergeRefs([ref, localRef])}
              value={value}
              hasError={hasError}
              selectTrigger={{
                isOpen: trigger.isOpen,
                onClick: trigger.onClick,
                ref: trigger.ref,
              }}
            />
          )
        }
      />
    );
  },
);

export default PhoneInput;
