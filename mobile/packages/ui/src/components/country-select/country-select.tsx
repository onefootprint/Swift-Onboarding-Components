import { COUNTRIES, CountryRecord } from '@onefootprint/global-constants';
import React from 'react';

import { Box } from '../box';
import { Select, SelectOption } from '../select';
import { Typography } from '../typography';

export type CountrySelectProps = {
  disabled?: boolean;
  hasError?: boolean;
  hint?: string;
  onChange?: (newValue: SelectOption<CountryRecord>) => void;
  options?: CountryRecord[];
  value?: SelectOption<CountryRecord>;
};

const CountrySelect = ({
  disabled,
  hasError,
  hint,
  onChange,
  options = COUNTRIES,
  value,
}: CountrySelectProps) => {
  return (
    <Select<CountryRecord>
      disabled={disabled}
      emptyStateTitle="No countries found"
      hasError={hasError}
      hint={hint}
      label="Country"
      onChange={onChange}
      options={options}
      placeholder="Select country"
      renderTrigger={(placeholder, selectedOption) => {
        return selectedOption ? (
          <Box gap={4} flexDirection="row" center>
            <Typography
              variant="body-4"
              color={disabled ? 'quaternary' : 'primary'}
            >
              {selectedOption.label}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body-4">{placeholder}</Typography>
        );
      }}
      value={value}
    />
  );
};

export default CountrySelect;
