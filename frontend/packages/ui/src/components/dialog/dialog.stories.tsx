import type { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import Box from '../box';
import Button from '../button';
import Dialog from './dialog';
import type { DialogProps } from './dialog.types';

export default {
  title: 'Components/Dialog',
  component: Dialog,
  argTypes: {
    title: {
      description: 'The header text of the dialog',
    },
    description: {
      control: 'text',
      description: 'The description text of the dialog',
    },
    open: {
      control: 'boolean',
      description: 'Whether the dialog is open',
    },
    size: {
      control: 'select',
      options: ['compact', 'default', 'large', 'full-screen'],
      description: 'The size of the dialog',
    },
    isConfirmation: {
      control: 'boolean',
      description: 'Whether the dialog is a confirmation dialog',
    },
    primaryButton: {
      control: 'object',
      description: 'Primary button configuration',
    },
    secondaryButton: {
      control: 'object',
      description: 'Secondary button configuration',
    },
    linkButton: {
      control: 'object',
      description: 'Link button configuration',
    },
  },
} as Meta;

const Template: Story<DialogProps> = ({
  title,
  open,
  size,
  isConfirmation,
  primaryButton,
  secondaryButton,
  linkButton,
}) => {
  const [isOpen, setOpen] = useState(open);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <Dialog
        title={title}
        open={isOpen}
        size={size}
        isConfirmation={isConfirmation}
        primaryButton={primaryButton}
        secondaryButton={secondaryButton}
        linkButton={linkButton}
        onClose={() => setOpen(false)}
      >
        <Box minHeight="80px" />
      </Dialog>
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
  title: 'Dialog Title',
  open: false,
};

export const WithButtons = Template.bind({});
WithButtons.args = {
  title: 'Dialog Title',
  open: false,
  primaryButton: {
    label: 'Confirm',
    onClick: () => alert('Confirmed'),
  },
  secondaryButton: {
    label: 'Cancel',
    onClick: () => alert('Cancelled'),
  },
  linkButton: {
    label: 'Learn More',
    onClick: () => alert('Learn More Clicked'),
  },
};

export const FullScreen = Template.bind({});
FullScreen.args = {
  title: 'Dialog Title',
  open: false,
  size: 'full-screen',
  primaryButton: {
    label: 'Confirm',
    onClick: () => alert('Confirmed'),
  },
  secondaryButton: {
    label: 'Cancel',
    onClick: () => alert('Cancelled'),
  },
  linkButton: {
    label: 'Learn More',
    onClick: () => alert('Learn More Clicked'),
  },
};

export const ConfirmationDialog = Template.bind({});
ConfirmationDialog.args = {
  title: 'Are you sure?',
  open: false,
  isConfirmation: true,
};
