import type { Meta, StoryFn } from '@storybook/react';

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
    tooltip: {
      control: 'object',
      description: 'Tooltip configuration',
      table: {
        type: {
          summary: '{ position?: "top" | "bottom" | "left" | "right", text?: string, textConfirmation?: string }',
        },
        defaultValue: { summary: '{ position: "top", text: "Copy to clipboard", textConfirmation: "Copied!" }' },
      },
    },
    title: {
      control: 'text',
      description: 'Title to display in the header',
      required: false,
    },
    disableCopy: {
      control: 'boolean',
      description: 'Disable copy functionality',
      required: false,
    },
  },
} as Meta;

const Template: StoryFn<CodeBlockProps> = ({
  ariaLabel = 'Copy to clipboard',
  children,
  language,
  title,
  tooltip,
  disableCopy,
}: CodeBlockProps) => (
  <CodeBlock ariaLabel={ariaLabel} language={language} title={title} tooltip={tooltip} disableCopy={disableCopy}>
    {children}
  </CodeBlock>
);

export const Base = Template.bind({});
Base.args = {
  title: 'Example',
  ariaLabel: 'Copy',
  children: `
  function doSomething(){
    x = 33;
    console.log(x);
    var x;
  } 
  `,
  language: 'javascript',
  tooltip: {
    text: 'Copy to clipboard',
    textConfirmation: 'Copied!',
  },
};

export const WithoutCopy = Template.bind({});
WithoutCopy.args = {
  title: 'Example',
  ariaLabel: 'Copy',
  children: `
  function doSomething(){
    x = 33;
    console.log(x);
    var x;
  } 
  `,
  language: 'javascript',
  tooltip: {
    text: 'Copy to clipboard',
    textConfirmation: 'Copied!',
  },
  disableCopy: true,
};
