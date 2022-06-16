import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import Button from '../button';
import Typography from '../typography';
import Dialog, { DialogProps } from './dialog';

export default {
  component: Dialog,
  title: 'Components/Dialog',
  argTypes: {
    title: {
      control: 'text',
      table: {
        type: { summary: 'string', required: true },
      },
      description: 'The header text of the dialog',
    },
    closeAriaLabel: {
      control: 'text',
      table: {
        type: { summary: 'string', required: false },
        defaultValue: { summary: 'Close' },
      },
      description: 'The aria label for the close button',
    },
    children: {
      control: 'text',
      table: {
        type: { summary: 'string', required: true },
      },
      description: 'The dialog content',
    },
    testID: {
      control: 'text',
      table: {
        type: { summary: 'string', required: false },
      },
      description: 'Append an attribute data-testid for testing purposes',
    },
    open: {
      control: 'boolean',
      description: 'Show/Hide the dialog',
      table: {
        type: { summary: 'string', required: false },
        defaultValue: { summary: 'false' },
      },
    },
    onClose: {
      control: 'function',
      description: 'Function called when the user requests to close the dialog',
      table: {
        type: { summary: 'function', required: false },
      },
    },
    size: {
      control: 'select',
      description: 'The size of the dialog',
      options: ['default', 'compact', 'large'],
      table: {
        type: { summary: 'string', required: false },
        defaultValue: { summary: 'default' },
      },
    },
    primaryButton: {
      control: 'object',
      description: 'The primary button',
      table: {
        type: { summary: 'object', required: true },
      },
    },
    secondaryButton: {
      control: 'object',
      description: 'The secondary button',
      table: {
        type: { summary: 'object', required: true },
      },
    },
    linkButton: {
      control: 'object',
      description: 'The link button, which is rendered on the left',
      table: {
        type: { summary: 'object', required: true },
      },
    },
  },
} as Meta;

const Template: Story<DialogProps> = ({
  children,
  title,
  onClose,
  primaryButton,
  secondaryButton,
  size,
  testID,
  open: initialOpen,
}: DialogProps) => {
  const [open, setOpen] = useState(initialOpen);

  return (
    <>
      <Dialog
        title={title}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
        primaryButton={primaryButton}
        secondaryButton={secondaryButton}
        linkButton={undefined}
        size={size}
        testID={testID}
        open={open}
      >
        <Typography variant="body-4">{children}</Typography>
      </Dialog>
      <Button onClick={() => setOpen(true)} size="default">
        Open dialog
      </Button>
    </>
  );
};

export const Base = Template.bind({});
Base.args = {
  children: 'Content',
  open: false,
  size: 'default',
  closeAriaLabel: 'Close',
  title: 'Title',
  primaryButton: {
    label: 'Primary',
    onClick: () => {
      alert('Primary button clicked');
    },
  },
  secondaryButton: {
    label: 'Secondary',
    onClick: () => {
      alert('Secondary button clicked');
    },
  },
  onClose: () => {
    console.log('close');
  },
  testID: 'dialog-test-id',
};

export const OnlyPrimary = Template.bind({});
OnlyPrimary.args = {
  open: false,
  size: 'default',
  title: 'Title',
  primaryButton: {
    label: 'Primary',
  },
  onClose: () => {
    console.log('close');
  },
};

const LinkTemplate: Story<DialogProps> = ({
  title,
  onClose,
  primaryButton,
  linkButton,
  size,
  testID,
  open: initialVisibility,
}: DialogProps) => {
  const [open, setOpen] = useState(initialVisibility);

  return (
    <>
      <Dialog
        title={title}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
        primaryButton={primaryButton}
        linkButton={linkButton}
        secondaryButton={undefined}
        size={size}
        testID={testID}
        open={open}
      >
        <Typography variant="body-4">Content</Typography>
      </Dialog>
      <Button onClick={() => setOpen(true)} size="default">
        Open dialog
      </Button>
    </>
  );
};

export const PrimaryAndLink = LinkTemplate.bind({});
PrimaryAndLink.args = {
  open: false,
  size: 'default',
  title: 'Title',
  primaryButton: {
    label: 'Primary',
  },
  linkButton: {
    label: 'Link button',
  },
  onClose: () => {
    console.log('close');
  },
};
