import type { Meta, Story } from '@storybook/react';
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

const Template: Story<InlineAlertProps> = ({ children, variant, cta }: InlineAlertProps) => (
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
