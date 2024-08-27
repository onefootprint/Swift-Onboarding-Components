import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

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
      type: 'function',
      description: 'Callback when the option is changed',
    },
  },
} satisfies Meta<typeof Stepper>;

const Template: StoryFn<StepperProps> = ({
  'aria-label': ariaLabel,
  options: defaultOptions,
  onChange,
}: StepperProps) => {
  const [options, setOptions] = useState(defaultOptions);
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const value = options[index];
  const subValue = value.options?.[subIndex];

  return (
    <Box>
      <Stepper
        aria-label={ariaLabel}
        options={options}
        value={{
          option: value,
          subOption: subValue,
        }}
        onChange={newValue => {
          let nextIndex = 0;
          let nextSubIndex = 0;
          options.forEach((option, i) => {
            if (option.value === newValue.value) {
              nextIndex = i;
              nextSubIndex = 0;
            } else if (option.options) {
              const subOptionIndex = option.options.findIndex(subOption => subOption.value === newValue.value);
              if (subOptionIndex !== -1) {
                nextIndex = i;
                nextSubIndex = subOptionIndex;
              }
            }
          });
          setIndex(nextIndex);
          setSubIndex(nextSubIndex);
          onChange?.(newValue);
        }}
      />
      <Box marginTop={6}>
        <Divider />
      </Box>
      <Stack gap={2} marginTop={7}>
        <Button
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
          onClick={() => {
            let nextIndex = index + 1;
            const subOptions = options[index].options;
            const numSubOptions = subOptions?.length ?? 0;
            if (subIndex + 1 < numSubOptions) {
              setSubIndex(subIndex + 1);
              nextIndex = index;
            } else {
              setSubIndex(0);
            }
            if (nextIndex >= options.length) return;
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

export const WithSubOptions = Template.bind({});
WithSubOptions.args = {
  'aria-label': 'Select',
  options: [
    {
      label: 'Who to onboard',
      value: 'who-to-onboard',
      options: [
        { label: 'Option 1', value: 'value 1' },
        { label: 'Option 2', value: 'value 2' },
      ],
    },
    {
      label: 'Your Playbook',
      value: 'your-playbook',
      options: [
        { label: 'Option A', value: 'value A' },
        { label: 'Option B', value: 'value B' },
      ],
    },
    { label: 'Name your Playbook', value: 'name-your-playbook' },
  ],
  value: undefined,
  onChange: console.log,
};
