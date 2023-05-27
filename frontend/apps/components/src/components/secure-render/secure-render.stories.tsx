import { Meta, Story } from '@storybook/react';
import React from 'react';

import SecureRender, { SecureRenderProps } from './secure-render';

export default {
  component: SecureRender,
  title: 'Components/SecureRender',
  argTypes: {
    isHidden: {
      control: 'boolean',
      description: 'Hides the value and shows a button to show it',
      required: true,
    },
    label: {
      control: 'text',
      description: 'Displays a label text, above the input',
      required: false,
    },
    canCopy: {
      control: 'boolean',
      description: 'Shows a button to copy the value',
      required: false,
    },
    mask: {
      control: 'select',
      options: ['creditCard', 'cvc', 'date'],
      description: 'Mask the value',
      required: false,
    },
    onShow: {
      description: 'Event when the show button is clicked',
      required: true,
    },
    value: {
      control: 'text',
      description: 'Controlled value',
    },
  },
} as Meta;

const Template: Story<SecureRenderProps> = ({
  isHidden,
  label,
  mask,
  onShow,
  value,
}: SecureRenderProps) => (
  <SecureRender
    isHidden={isHidden}
    label={label}
    mask={mask}
    onShow={onShow}
    value={value}
  />
);

export const CreditCard = Template.bind({});
CreditCard.args = {
  isHidden: true,
  label: 'Credit card',
  mask: 'creditCard',
  onShow: () => {},
  value: '4242424242424242',
};

export const Cvc = Template.bind({});
Cvc.args = {
  isHidden: true,
  label: 'CVC',
  mask: 'cvc',
  onShow: () => {},
  value: '123',
};

export const Date = Template.bind({});
Date.args = {
  isHidden: true,
  label: 'Date',
  mask: 'date',
  onShow: () => {},
  value: '1234',
};
