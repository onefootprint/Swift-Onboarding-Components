import type { Meta, Story } from '@storybook/react';

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
    title: {
      control: 'text',
      description: 'Copy to clipboard',
      required: true,
    },
  },
} as Meta;

const Template: Story<CodeBlockProps> = ({
  ariaLabel = 'Copy to clipboard',
  children,
  language,
  title,
  tooltipText,
  tooltipTextConfirmation,
  disableCopy,
}: CodeBlockProps) => (
  <CodeBlock
    ariaLabel={ariaLabel}
    language={language}
    title={title}
    tooltipText={tooltipText}
    tooltipTextConfirmation={tooltipTextConfirmation}
    disableCopy={disableCopy}
  >
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
  tooltipText: 'Copy to clipboard',
  tooltipTextConfirmation: 'Copied!',
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
  tooltipText: 'Copy to clipboard',
  tooltipTextConfirmation: 'Copied!',
  disableCopy: true,
};
