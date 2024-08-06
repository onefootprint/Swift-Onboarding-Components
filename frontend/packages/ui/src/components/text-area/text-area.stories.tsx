import type { Meta, Story } from '@storybook/react';
import { useState } from 'react';

import type { TextAreaProps } from './text-area';
import TextArea from './text-area';

export default {
  component: TextArea,
  title: 'Components/TextArea',
  argTypes: {
    disabled: {
      control: 'boolean',
      description: 'Specifies that the input element should be disabled',
      required: false,
      table: { defaultValue: { summary: 'false' } },
    },
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
    label: {
      control: 'text',
      description: 'Displays a label text, above the input',
      required: false,
    },
    onChange: {
      description: 'Native onChange event',
      required: false,
    },
    onChangeText: {
      description: 'Event when the text changes, sending only the text',
      required: false,
    },
    placeholder: {
      control: 'text',
      description: 'An informative text that goes inside the input',
      required: false,
      name: 'Placeholder *',
    },
    value: {
      control: 'text',
      description: 'Controlled value',
    },
  },
} as Meta;

const Template: Story<TextAreaProps> = ({
  disabled,
  hasError,
  hint,
  label,
  maxLength,
  minLength,
  onChange,
  onChangeText,
  placeholder,
  value: initialValue = '',
}: TextAreaProps) => {
  const [value, setValue] = useState<string | ReadonlyArray<string> | number | undefined>(initialValue);
  const handleChangeText = (text: string) => {
    setValue(text);
    if (onChangeText) onChangeText(text);
  };
  return (
    <TextArea
      disabled={disabled}
      hasError={hasError}
      hint={hint}
      label={label}
      maxLength={maxLength}
      minLength={minLength}
      onChange={onChange}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      value={value}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  disabled: false,
  hint: '',
  label: 'Specify the reason',
  onChange: console.log, // eslint-disable-line no-console
  onChangeText: console.log, // eslint-disable-line no-console
  placeholder: 'Give a detailed reason',
  value: '',
  hasError: false,
};
