import { Meta, Story } from '@storybook/react';
import React from 'react';

import CodeBlock, { CodeBlockProps } from './code-block';

export default {
  component: CodeBlock,
  title: 'Components/CodeBlock',
  argTypes: {
    buttonAriaLabel: {
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
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
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
  buttonAriaLabel,
  children,
  language,
  testID,
  tooltipText,
  tooltipTextConfirmation,
}: CodeBlockProps) => (
  <CodeBlock
    language={language}
    buttonAriaLabel={buttonAriaLabel}
    testID={testID}
    tooltipText={tooltipText}
    tooltipTextConfirmation={tooltipTextConfirmation}
  >
    {children}
  </CodeBlock>
);

export const Base = Template.bind({});
Base.args = {
  buttonAriaLabel: 'Copy',
  children: `
  function doSomething(){
    x = 33;
    console.log(x);
    var x;
  } 
  `,
  language: 'javascript',
  testID: 'code-test-id',
  tooltipText: 'Copy to clipboard',
  tooltipTextConfirmation: 'Copied!',
};
