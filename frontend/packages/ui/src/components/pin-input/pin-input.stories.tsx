import type { ComponentMeta, Story } from '@storybook/react';
import { useState } from 'react';

import AnimatedLoadingSpinner from '../animated-loading-spinner';
import Box from '../box';
import LinkButton from '../link-button';
import Stack from '../stack';
import Text from '../text';
import type { PinInputProps } from './pin-input';
import PinInput from './pin-input';

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
    hint: {
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
  },
} as ComponentMeta<typeof PinInput>;

const Template: Story<PinInputProps> = ({
  hasError: baseHasError = false,
  hint: basehint,
  onComplete,
  testID,
}: PinInputProps) => {
  const [loading, setLoading] = useState(false);
  const [hasError, setError] = useState(false);
  const [hint, sethint] = useState('');

  const handleComplete = (pin: string) => {
    onComplete(pin);
    setLoading(true);
    setTimeout(() => {
      setError(true);
      setLoading(false);
      sethint('Incorrect verification code');
    }, 1500);
  };

  return (
    <Stack
      align="center"
      borderRadius="sm"
      direction="column"
      height="240px"
      justify="center"
      width="500px"
      elevation={2}
    >
      <Box marginBottom={3}>
        <Text variant="heading-2" color="primary">
          Welcome back! 🎉
        </Text>
      </Box>
      <Box marginBottom={8}>
        <Text variant="body-2" color="secondary">
          Enter the 6-digit code sent to your phone
        </Text>
      </Box>
      <Box marginBottom={8}>
        {loading ? (
          <AnimatedLoadingSpinner animationStart />
        ) : (
          <PinInput
            hasError={baseHasError || hasError}
            hint={basehint || hint}
            onComplete={handleComplete}
            testID={testID}
          />
        )}
      </Box>
      <Box>
        <LinkButton>Resend code</LinkButton>
      </Box>
    </Stack>
  );
};

export const Base = Template.bind({});
Base.args = {
  hasError: false,
  hint: '',
  onComplete: console.log, // eslint-disable-line no-console
  testID: 'pin-input-test-id',
};

export const WithError = Template.bind({});
WithError.args = {
  hasError: true,
  hint: 'Incorrect verification code',
  onComplete: console.log, // eslint-disable-line no-console
};
