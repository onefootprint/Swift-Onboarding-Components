import type { Meta, Story } from '@storybook/react';
import { useState } from 'react';

import type { ThemeToggleProps } from './theme-toggle';
import ThemeToggle from './theme-toggle';

export default {
  component: ThemeToggle,
  title: 'Components/ThemeToggle',
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
    name: {
      control: 'text',
      description: 'The name of the input field in a checkbox (Useful for form submission).',
      required: false,
    },
    label: {
      control: 'text',
      description: 'Toggle label',
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
  },
} as Meta;

const Template: Story<ThemeToggleProps> = ({
  checked: initialChecked,
  defaultChecked,
  label,
  name,
  onBlur,
  onChange,
  onFocus,
}: ThemeToggleProps) => {
  const [checked, setChecked] = useState<boolean | undefined>(initialChecked);

  return (
    <ThemeToggle
      checked={checked}
      defaultChecked={defaultChecked}
      label={label}
      name={name}
      onBlur={onBlur}
      onChange={event => {
        const nextValue = event.target.checked;
        setChecked(nextValue);
        onChange?.(event);
      }}
      onFocus={onFocus}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  checked: false,
  defaultChecked: false,
  label: 'Toggle',
  name: 'toggle',
  onBlur: console.log, // eslint-disable-line no-console
  onChange: console.log, // eslint-disable-line no-console
  onFocus: console.log, // eslint-disable-line no-console
};
