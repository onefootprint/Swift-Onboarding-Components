import type { Meta, Story } from '@storybook/react';
import { useState } from 'react';

import Box from '../box';
import type { ToggleProps } from './toggle';
import Toggle from './toggle';

export default {
  component: Toggle,
  title: 'Components/Toggle',
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Indicate if the toggle is checked or not',
      required: false,
    },
    defaultChecked: {
      control: 'boolean',
      description: 'Default checked value',
      required: false,
    },
    id: {
      control: 'text',
      description: 'id assigned to input',
      required: false,
    },
    name: {
      control: 'text',
      description: 'The name of the input field in a checkbox (Useful for form submission).',
      required: false,
    },
    disabled: {
      control: 'boolean',
      description: 'If true, the checkbox will be disabled',
      required: false,
    },
    fullWidth: {
      control: 'boolean',
      description: 'Use 100% of the parent container width',
      required: false,
    },
    label: {
      control: 'text',
      description: 'Toggle label',
      required: false,
    },
    labelPlacement: {
      control: {
        type: 'select',
      },
      type: { name: 'string', required: false },
      description: 'Label placement',
      options: ['left', 'right'],
      table: { defaultValue: { summary: 'right' } },
    },
    hint: {
      control: 'text',
      description: 'Toggle hint',
      required: false,
    },
    required: {
      control: 'boolean',
      description: 'If true, the checkbox input is marked as required, and required attribute will be added',
      required: false,
    },
    onBlur: {
      control: 'function',
      description: 'The callback invoked when the checkbox is blurred (loses focus)',
      required: false,
    },
    onChange: {
      control: 'function',
      description: 'The callback invoked when the checked state of the Checkbox changes.',
      required: false,
    },
    onFocus: {
      control: 'function',
      description: 'The callback invoked when the checkbox is focused',
      required: false,
    },
    size: {
      control: {
        type: 'select',
        required: false,
      },
      options: ['default', 'compact'],
    },
  },
} as Meta;

const Template: Story<ToggleProps> = ({
  checked: initialChecked,
  defaultChecked,
  disabled,
  fullWidth,
  hint,
  id,
  label,
  labelPlacement,
  name,
  onBlur,
  onChange,
  onFocus,
  required,
  size,
}: ToggleProps) => {
  const [checked, setChecked] = useState<boolean | undefined>(initialChecked);

  return (
    <Box>
      <Toggle
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        fullWidth={fullWidth}
        hint={hint}
        id={id}
        label={label}
        labelPlacement={labelPlacement}
        name={name}
        onBlur={onBlur}
        onChange={event => {
          const nextValue = event.target.checked;
          setChecked(nextValue);
          onChange?.(event);
        }}
        onFocus={onFocus}
        required={required}
        size={size}
      />
    </Box>
  );
};

export const Base = Template.bind({});
Base.args = {
  checked: false,
  defaultChecked: false,
  disabled: false,
  fullWidth: false,
  hint: 'Toggle hint',
  id: 'toggle-id',
  label: 'Toggle',
  labelPlacement: 'right',
  name: 'toggle',
  onBlur: console.log, // eslint-disable-line no-console
  onChange: console.log, // eslint-disable-line no-console
  onFocus: console.log, // eslint-disable-line no-console
  required: false,
  size: 'default',
};
