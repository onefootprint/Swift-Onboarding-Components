import type { Meta, StoryFn } from '@storybook/react';

import type { CodeInlineProps } from './code-inline';
import CodeInline from './code-inline';

export default {
  component: CodeInline,
  title: 'Components/CodeInline',
  argTypes: {
    ariaLabel: {
      control: 'text',
      description: 'Copy to clipboard',
      required: true,
    },
    children: {
      control: 'text',
      description: 'Content to be rendered',
      required: true,
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled copy',
      required: false,
    },
    tooltip: {
      control: 'object',
      description: 'Tooltip configuration',
      required: false,
    },
    size: {
      control: {
        type: 'select',
        options: ['default', 'compact'],
      },
    },
  },
} as Meta;

const Template: StoryFn<CodeInlineProps> = ({ ariaLabel, children, disabled, tooltip, size }: CodeInlineProps) => (
  <CodeInline ariaLabel={ariaLabel} disabled={disabled} tooltip={tooltip} size={size}>
    {children}
  </CodeInline>
);

export const Base = Template.bind({});
Base.args = {
  ariaLabel: 'Copy',
  children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
  disabled: false,
  tooltip: {
    text: 'Copy to clipboard',
    textConfirmation: 'Copied!',
  },
  size: 'default',
};
