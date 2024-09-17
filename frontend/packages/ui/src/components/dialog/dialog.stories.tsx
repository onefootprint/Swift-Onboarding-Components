import { IcoClose24, icos } from '@onefootprint/icons';
import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import Text from '../text';
import type { DialogProps } from './dialog';
import Dialog from './dialog';

export default {
  component: Dialog,
  title: 'Components/Dialog',
  argTypes: {
    title: { control: 'text' },
    headerIcon: { control: 'select', options: Object.keys(icos) },
    onClose: { action: 'onClose' },
    children: { control: 'text' },
    testID: { control: 'text' },
    open: { control: 'boolean' },
    size: { control: 'select', options: ['default', 'compact', 'large', 'full-screen'] },
    primaryButton: { control: 'object' },
    secondaryButton: { control: 'object' },
    linkButton: { control: 'object' },
    headerButton: { control: 'object' },
    isConfirmation: { control: 'boolean' },
  },
} satisfies Meta<typeof Dialog>;

const Template: StoryFn<DialogProps> = args => {
  const [open, setOpen] = useState(true);
  const HeaderIcon =
    typeof args.headerIcon?.component === 'string'
      ? icos[args.headerIcon.component]
      : args.headerIcon?.component || IcoClose24;

  const handleClose = () => {
    setOpen(false);
    args.onClose?.();
  };

  return (
    <Dialog
      {...args}
      open={open}
      onClose={handleClose}
      headerIcon={{
        ...args.headerIcon,
        component: HeaderIcon,
        onClick: handleClose,
      }}
    >
      <Text variant="body-3">{args.children}</Text>
    </Dialog>
  );
};

export const Base = Template.bind({});
Base.args = {
  children: 'Content',
  open: true,
  size: 'default',
  testID: 'dialog-test-id',
  title: 'Title',
  isConfirmation: false,
};

export const OnlyPrimary = Template.bind({});
OnlyPrimary.args = {
  ...Base.args,
  primaryButton: { label: 'Primary', onClick: () => alert('Primary clicked') },
};

export const PrimaryAndSecondary = Template.bind({});
PrimaryAndSecondary.args = {
  ...Base.args,
  primaryButton: { label: 'Primary', onClick: () => alert('Primary clicked') },
  secondaryButton: { label: 'Secondary', onClick: () => alert('Secondary clicked') },
};

export const PrimarySecondaryAndLink = Template.bind({});
PrimarySecondaryAndLink.args = {
  ...Base.args,
  primaryButton: { label: 'Primary', onClick: () => alert('Primary clicked') },
  secondaryButton: { label: 'Secondary', onClick: () => alert('Secondary clicked') },
  linkButton: { label: 'Link button', onClick: () => alert('Link clicked') },
};

export const Confirmation = Template.bind({});
Confirmation.args = {
  ...Base.args,
  isConfirmation: true,
  primaryButton: { label: 'Confirm', onClick: () => alert('Confirmed') },
  secondaryButton: { label: 'Cancel', onClick: () => alert('Cancelled') },
};
