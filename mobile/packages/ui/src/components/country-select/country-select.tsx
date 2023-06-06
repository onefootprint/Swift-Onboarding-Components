import { COUNTRIES, CountryRecord } from '@onefootprint/global-constants';
import React from 'react';

import { Box } from '../box';
import { Flag } from '../flag';
import { Select, SelectOption } from '../select';
import { Typography } from '../typography';

export type CountrySelectProps = {
  hasError?: boolean;
  hint?: string;
  onChange?: (newValue: SelectOption<CountryRecord>) => void;
  value?: SelectOption<CountryRecord>;
};

const CountrySelect = ({
  hasError,
  hint,
  onChange,
  value,
}: CountrySelectProps) => {
  return (
    <Select<CountryRecord>
      emptyStateTitle="No countries found"
      hasError={hasError}
      hint={hint}
      label="Country"
      onChange={onChange}
      options={COUNTRIES}
      placeholder="Select country"
      renderTrigger={(placeholder, selectedOption) => {
        return selectedOption ? (
          <Box gap={4} flexDirection="row" center>
            <Flag code={selectedOption.value} />
            <Typography variant="body-4">{selectedOption.label}</Typography>
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
