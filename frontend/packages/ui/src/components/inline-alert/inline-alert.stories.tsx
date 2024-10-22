import type { Meta, StoryFn } from '@storybook/react';
import type { InlineAlertProps } from './inline-alert';
import InlineAlert from './inline-alert';

export default {
  component: InlineAlert,
  title: 'Components/InlineAlert',
  argTypes: {
    children: {
      control: 'text',
      description: 'Content to be rendered',
      required: true,
    },
    variant: {
      control: 'select',
      description: 'Intent of the Inline Alert',
      options: ['info', 'error', 'warning'],
      required: true,
    },
  },
} as Meta;

const Template: StoryFn<InlineAlertProps> = ({ children, variant, cta }: InlineAlertProps) => (
  <InlineAlert cta={cta} variant={variant}>
    {children}
  </InlineAlert>
);

export const Base = Template.bind({});
Base.args = {
  children: 'Critical message goes here.',
  variant: 'error',
};

export const Warning = Template.bind({});
Warning.args = {
  children: 'Warning message goes here.',
  variant: 'warning',
};

export const Info = Template.bind({});
Info.args = {
  children: 'Info message goes here.',
  variant: 'info',
};

export const WithCta = Template.bind({});
WithCta.args = {
  children: 'Info message goes here.',
  variant: 'info',
  cta: {
    label: 'Dismiss',
    onClick: () => undefined,
  },
};

export const Neutral = Template.bind({});
Neutral.args = {
  children: 'Neutral message goes here.',
  variant: 'neutral',
  cta: {
    label: 'Dismiss',
    onClick: () => undefined,
  },
};

export const VeryLong = Template.bind({});
VeryLong.args = {
  children:
    'Aute duis nisi cillum ad sunt culpa do amet duis duis sunt magna qui. Elit cillum consequat et dolore nulla fugiat. Laborum occaecat magna laboris mollit id ea ex. Nulla pariatur laboris aliqua.',
  variant: 'neutral',
  cta: {
    label: 'Dismiss',
    onClick: () => undefined,
  },
};
