import { ComponentMeta, Story } from '@storybook/react';
import React, { useState } from 'react';

import Box from '../box';
import LinkButton from '../link-button';
import Typography from '../typography';
import PinInput, { PinInputProps } from './pin-input';

export default {
  title: 'Components/PinInput',
  component: PinInput,
  argTypes: {
    hasError: {
      control: 'boolean',
      description: 'Gives an error state to the input and hint',
      required: false,
      table: { defaultValue: { summary: 'false' } },
    },
    hintText: {
      control: 'text',
      description: 'Display an informative text below the input',
      required: false,
    },
    onComplete: {
      description: 'Function called on input change',
      required: false,
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
    loading: {
      control: 'boolean',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as ComponentMeta<typeof PinInput>;

const Template: Story<PinInputProps> = ({
  hasError: baseHasError = false,
  hintText: baseHintText,
  loading: baseLoading = false,
  loadingTestID,
  onComplete,
  testID,
}: PinInputProps) => {
  const [loading, setLoading] = useState(false);
  const [hasError, setError] = useState(false);
  const [hintText, setHintText] = useState('');

  const handleComplete = (pin: string) => {
    onComplete(pin);
    setLoading(true);
    setTimeout(() => {
      setError(true);
      setLoading(false);
      setHintText('Incorrect verification code');
    }, 1500);
  };

  return (
    <Box
      sx={{
        alignItems: 'center',
        borderRadius: 1,
        display: 'flex',
        elevation: 2,
        flexDirection: 'column',
        height: '240px',
        justifyContent: 'center',
        width: '500px',
      }}
    >
      <Box sx={{ marginBottom: 3 }}>
        <Typography variant="heading-2" color="primary">
          Welcome back! 🎉
        </Typography>
      </Box>
      <Box sx={{ marginBottom: 8 }}>
        <Typography variant="body-2" color="secondary">
          Enter the 6-digit code sent to your phone
        </Typography>
      </Box>
      <Box sx={{ marginBottom: 8 }}>
        <PinInput
          hasError={baseHasError || hasError}
          hintText={baseHintText || hintText}
          loading={baseLoading || loading}
          loadingTestID={loadingTestID}
          onComplete={handleComplete}
          testID={testID}
        />
      </Box>
      <Box>
        <LinkButton size="compact">Resend code</LinkButton>
      </Box>
    </Box>
  );
};

export const Base = Template.bind({});
Base.args = {
  hasError: false,
  loading: false,
  loadingTestID: '',
  hintText: '',
  onComplete: console.log,
  testID: 'pin-input-test-id',
};

export const WithError = Template.bind({});
WithError.args = {
  hasError: true,
  hintText: 'Incorrect verification code',
  onComplete: console.log,
};

export const WithLoading = Template.bind({});
WithLoading.args = {
  loading: true,
  onComplete: console.log,
};
