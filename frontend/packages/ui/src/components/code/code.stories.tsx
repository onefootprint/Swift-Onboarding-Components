import { Meta, Story } from '@storybook/react';
import React from 'react';

import Code, { CodeProps } from './code';

export default {
  component: Code,
  title: 'Components/Code',
  argTypes: {
    children: {
      control: 'text',
      description: 'Content to be rendered',
      required: true,
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as Meta;

const Template: Story<CodeProps> = ({ children, testID }: CodeProps) => (
  <Code testID={testID}>{children}</Code>
);

export const Base = Template.bind({});
Base.args = {
  children: 'fp_xm7T6MqhfRBkxL0DPOpfwM4',
  testID: 'code-test-id',
};
