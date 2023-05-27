import { Meta, Story } from '@storybook/react';
import React from 'react';

import SecureForm, { SecureFormProps, SecureFormType } from './secure-form';

export default {
  component: SecureForm,
  title: 'Components/SecureForm',
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

const Template: Story<SecureFormProps> = ({
  title,
  type,
  variant,
  onSave,
  onClose,
  onCancel,
}: SecureFormProps) => (
  <SecureForm
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
  onSave: console.log, // eslint-disable-line no-console
  onCancel: () => console.log('canceled'), // eslint-disable-line no-console
  onClose: () => console.log('closed'), // eslint-disable-line no-console
};
