import { SecureFormType } from '@onefootprint/footprint-components-js';
import { Meta, Story } from '@storybook/react';
import React from 'react';

import Form, { FormProps } from './form';

export default {
  component: Form,
  title: 'Components/Form',
  argTypes: {
    title: {
      control: 'text',
      description: 'Display a title text',
      required: false,
    },
    type: {
      control: 'select',
      options: Object.values(SecureFormType),
      description: 'Type of the form',
      required: false,
    },
    variant: {
      control: 'select',
      options: ['modal', 'card'],
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
  },
} as Meta;

const Template: Story<FormProps> = ({
  title,
  type,
  variant,
  onSave,
  onClose,
  onCancel,
}: FormProps) => (
  <Form
    title={title}
    type={type}
    variant={variant}
    onSave={onSave}
    onCancel={onCancel}
    onClose={onClose}
  />
);

export const Base = Template.bind({});

Base.args = {
  type: SecureFormType.cardOnly,
  variant: 'card',
  onSave: console.log, // eslint-disable-line no-console
  onCancel: () => console.log('canceled'), // eslint-disable-line no-console
  onClose: () => console.log('closed'), // eslint-disable-line no-console
};
