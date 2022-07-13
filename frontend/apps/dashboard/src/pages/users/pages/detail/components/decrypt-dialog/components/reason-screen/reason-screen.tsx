import React, { useEffect, useState } from 'react';
import { Box, Divider, Select, SelectOption, TextArea, Typography } from 'ui';

type ReasonScreenProps = {
  reason: string;
  setReason: (reason: string) => void;
  hasError: boolean;
};

const options = [
  {
    value: 'Responding to customer support inquiry',
    label: 'Responding to customer support inquiry',
  },
  {
    value: 'Sending communication to customer',
    label: 'Sending communication to customer',
  },
  {
    value: 'Verifying customer identity',
    label: 'Verifying customer identity',
  },
  {
    value: 'Auditor review',
    label: 'Auditor review',
  },
  {
    value: 'Transaction over $5k',
    label: 'Transaction over $5k',
  },
  {
    value: 'Change of direct deposit',
    label: 'Change of direct deposit',
  },
  {
    value: 'Other',
    label: 'Other',
  },
];

const ReasonScreen = ({ reason, setReason, hasError }: ReasonScreenProps) => {
  const [selectedOption, setSelectedOption] = useState<SelectOption<string>>();
  useEffect(() => {
    setReason(options[0].value);
    setSelectedOption(options[0]);
  }, [setReason, setSelectedOption]);
  return (
    <>
      <Typography variant="label-1" sx={{ marginBottom: 7 }}>
        Why are you decrypting this data?
      </Typography>
      <Select
        label="Reason"
        isSearchable={false}
        value={selectedOption}
        hasError={hasError}
        onChange={option => {
          setSelectedOption(option);
          // Clear reason value when "Other" is selected
          setReason(option.value !== 'Other' ? option.value : '');
        }}
        options={options}
      />
      {selectedOption?.value === 'Other' && (
        <Box sx={{ marginTop: 4 }}>
          <TextArea
            placeholder="Type the reason here..."
            hasError={hasError}
            hintText={hasError ? 'A reason is needed' : ''}
            value={reason}
            onChangeText={setReason}
          />
        </Box>
      )}
      <Box sx={{ marginTop: 7, marginBottom: 7 }}>
        <Divider />
      </Box>
      <Typography variant="body-3" color="tertiary">
        Please note that all data attribute access are logged for security
        reasons.
      </Typography>
    </>
  );
};

export default ReasonScreen;
