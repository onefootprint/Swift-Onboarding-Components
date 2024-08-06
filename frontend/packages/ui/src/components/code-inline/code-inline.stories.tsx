import type { Meta, Story } from '@storybook/react';

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
    truncate: {
      control: 'boolean',
      description: 'Prevent to break the line',
      required: false,
    },
    tooltipText: {
      control: {
        type: 'text',
      },
      type: { name: 'string', required: false },
      description: 'Tooltip text',
      table: { defaultValue: { summary: 'Copy to clipboard' } },
    },
    tooltipTextConfirmation: {
      control: {
        type: 'text',
      },
      type: { name: 'string', required: false },
      description: 'Toast title description',
      table: { defaultValue: { summary: 'Copied to clipboard' } },
    },
    size: {
      control: {
        type: 'select',
        options: ['default', 'compact'],
      },
    },
  },
} as Meta;

const Template: Story<CodeInlineProps> = ({
  ariaLabel,
  children,
  disabled,
  tooltipText,
  tooltipTextConfirmation,
  truncate,
  size,
}: CodeInlineProps) => (
  <CodeInline
    ariaLabel={ariaLabel}
    disabled={disabled}
    tooltipText={tooltipText}
    tooltipTextConfirmation={tooltipTextConfirmation}
    truncate={truncate}
    size={size}
  >
    {children}
  </CodeInline>
);

export const Base = Template.bind({});
Base.args = {
  ariaLabel: 'Copy',
  children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
  disabled: false,
  tooltipText: 'Copy to clipboard',
  tooltipTextConfirmation: 'Copied!',
  truncate: false,
  size: 'default',
};
