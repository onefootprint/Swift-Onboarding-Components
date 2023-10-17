import type { Meta, Story } from '@storybook/react';
import React from 'react';

import type { FormBaseProps } from './form-base';
import FormBase from './form-base';

export default {
  component: FormBase,
  title: 'Components/Form',
  argTypes: {
    title: {
      control: 'text',
      description: 'Display a title text',
      required: false,
    },
    variant: {
      control: 'select',
      options: ['modal', 'inline', 'drawer'],
      description: 'Variant of the form',
      required: false,
    },
    onSave: {
      control: 'function',
      description: 'Function called when the form is saved',
      required: false,
    },
    onCancel: {
      control: 'function',
      description: 'Function called when the cancel button is clicked',
      required: false,
    },
    canClose: {
      control: 'boolean',
      description: 'If true, the close button is displayed',
      required: false,
    },
    onClose: {
      control: 'function',
      description: 'Function called when the close button is clicked',
      required: false,
    },
    hideFootprintLogo: {
      control: 'boolean',
      description: 'If true, the footprint logo is hidden',
      required: false,
    },
    hideButtons: {
      control: 'boolean',
      description: 'If true, the buttons are hidden',
      required: false,
    },
  },
} as Meta;

const Template: Story<FormBaseProps> = ({
  title,
  variant,
  onSave,
  onClose,
  onCancel,
  hideFootprintLogo,
  hideButtons,
}: FormBaseProps) => (
  <FormBase
    title={title}
    sections={['card', 'name', 'fullAddress']}
    variant={variant}
    onSave={onSave}
    onCancel={onCancel}
    onClose={onClose}
    hideFootprintLogo={hideFootprintLogo}
    hideButtons={hideButtons}
  />
);

export const Base = Template.bind({});

Base.args = {
  variant: 'modal',
  onSave: console.log, // eslint-disable-line no-console
  onCancel: () => console.log('canceled'), // eslint-disable-line no-console
  onClose: () => console.log('closed'), // eslint-disable-line no-console
};
