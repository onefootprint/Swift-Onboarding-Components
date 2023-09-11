import type { Meta, Story } from '@storybook/react';
import React from 'react';

import type { CodeBlockProps } from './code-block';
import CodeBlock from './code-block';

export default {
  component: CodeBlock,
  title: 'Components/CodeBlock',
  argTypes: {
    ariaLabel: {
      control: 'text',
      description: 'Copy to clipboard',
      required: true,
    },
    children: {
      control: 'text',
      description: 'Code to be displayed',
      required: true,
    },
    language: {
      control: 'text',
      description: 'Code language to display in header',
      required: true,
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
  },
} as Meta;

const Template: Story<CodeBlockProps> = ({
  ariaLabel = 'Copy to clipboard',
  children,
  language,
  tooltipText,
  tooltipTextConfirmation,
}: CodeBlockProps) => (
  <CodeBlock
    language={language}
    ariaLabel={ariaLabel}
    tooltipText={tooltipText}
    tooltipTextConfirmation={tooltipTextConfirmation}
  >
    {children}
  </CodeBlock>
);

export const Base = Template.bind({});
Base.args = {
  ariaLabel: 'Copy',
  children: `
  function doSomething(){
    x = 33;
    console.log(x);
    var x;
  } 
  `,
  language: 'javascript',
  tooltipText: 'Copy to clipboard',
  tooltipTextConfirmation: 'Copied!',
};
