import type { StoryFn } from '@storybook/react';
import SelectNew from './select-new';
import type { SelectNewProps } from './select-new.types';

export default {
  component: SelectNew,
  title: 'Components/SelectNew',
  argTypes: {
    size: {
      control: {
        options: ['compact', 'default'],
        type: 'select',
      },
      description: 'Size of the select',
      name: 'Size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      name: 'Disabled',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
      name: 'Placeholder',
    },
    value: {
      control: 'text',
      description: 'Value of the select',
      name: 'Value',
    },
    triggerWidth: {
      control: {
        options: ['auto', 'default', 'narrow', 'wide'],
        type: 'select',
      },
      description: 'Width of the trigger',
      name: 'Trigger Width',
    },
    contentWidth: {
      control: {
        options: ['auto', 'default', 'full', 'narrow', 'wide'],
        type: 'select',
      },
      description: 'Width of the content',
      name: 'Content Width',
    },
    label: {
      control: 'text',
      description: 'Label text',
      name: 'Label',
    },
    hint: {
      control: 'text',
      description: 'Hint text',
      name: 'Hint',
    },
  },
};

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  {
    label: 'Option 3',
    value: '3',
    disabled: true,
    disabledTooltipText: 'Disabled tooltip help text',
  },
  { label: 'Very long Option 4', value: '4' },
];

const Template: StoryFn<SelectNewProps> = ({ size, disabled, label, hint, triggerWidth, contentWidth }) => (
  <SelectNew
    size={size}
    disabled={disabled}
    options={options}
    triggerWidth={triggerWidth}
    contentWidth={contentWidth}
    label={label}
    hint={hint}
  />
);

export const Default = Template.bind({});
Default.args = {
  size: 'default',
  disabled: false,
  placeholder: 'Select',
};
