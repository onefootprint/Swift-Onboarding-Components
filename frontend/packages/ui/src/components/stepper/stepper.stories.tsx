import type { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import Box from '../box';
import Button from '../button';
import Divider from '../divider';
import Stack from '../stack';
import type { StepperProps } from './stepper';
import Stepper from './stepper';

export default {
  component: Stepper,
  title: 'Components/Stepper',
  argTypes: {
    'aria-label': {
      control: 'text',
      description: 'Aria-label',
    },
    options: {
      control: 'object',
      description: 'An array containing the options, with label and value',
    },
    value: {
      control: 'object',
      description: 'The selected option',
    },
    onChange: {
      control: 'function',
      description: 'Callback when the option is changed',
    },
  },
} as Meta;

const Template: Story<StepperProps> = ({
  'aria-label': ariaLabel,
  options: defaultOptions,
  onChange,
}: StepperProps) => {
  const [options, setOptions] = useState(defaultOptions);
  const [index, setIndex] = useState(0);
  const value = options[index];

  return (
    <Box>
      <Stepper
        aria-label={ariaLabel}
        options={options}
        value={value}
        onChange={newValue => {
          const nextIndex = options.findIndex(
            option => option.value === newValue.value,
          );
          setIndex(nextIndex);
          onChange?.(newValue);
        }}
      />
      <Box marginTop={6}>
        <Divider />
      </Box>
      <Stack gap={2} marginTop={7}>
        <Button
          size="small"
          onClick={() => {
            const nextIndex = index - 1;
            if (nextIndex < 0) return;
            const [first] = options;
            if (nextIndex === 1 && first.options) {
              setOptions(defaultOptions);
              return;
            }
            setIndex(nextIndex);
            onChange?.(options[nextIndex]);
          }}
        >
          Back
        </Button>
        <Button
          size="small"
          onClick={() => {
            const nextIndex = index + 1;
            if (nextIndex >= options.length) return;
            const [first] = options;

            if (nextIndex === 1 && !first.options) {
              setOptions([
                {
                  label: 'Who to onboard',
                  value: 'who-to-onboard',
                  options: [{ label: 'Residency', value: 'residency' }],
                },
                { label: 'Your Playbook', value: 'your-playbook' },
                { label: 'Name your Playbook', value: 'name-your-playbook' },
              ]);
              return;
            }
            setIndex(nextIndex);
            onChange?.(options[nextIndex]);
          }}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
};

export const Base = Template.bind({});
Base.args = {
  'aria-label': 'Select',
  options: [
    { label: 'Who to onboard', value: 'who-to-onboard' },
    { label: 'Your Playbook', value: 'your-playbook' },
    { label: 'Name your Playbook', value: 'name-your-playbook' },
  ],
  value: undefined,
  onChange: console.log,
};
