import React from 'react';
import { Box, Divider, TextArea, Typography } from 'ui';

type ReasonScreenProps = {
  reason: string;
  setReason: (reason: string) => void;
  hasError: boolean;
};

const ReasonScreen = ({ reason, setReason, hasError }: ReasonScreenProps) => (
  <>
    <Typography variant="label-1" sx={{ marginBottom: 7 }}>
      Briefly describe why you need to decrypt this data.
    </Typography>
    <TextArea
      placeholder="Type the reason here..."
      hasError={hasError}
      hintText={hasError ? 'A reason is needed' : ''}
      value={reason}
      onChangeText={setReason}
    />
    <Box sx={{ marginTop: 7, marginBottom: 7 }}>
      <Divider />
    </Box>
    <Typography variant="body-3" color="tertiary">
      Please note that all data attribute access are logged for security
      reasons.
    </Typography>
  </>
);

export default ReasonScreen;
