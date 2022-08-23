import { Meta, Story } from '@storybook/react';
import { IcoClose24, icos } from 'icons';
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
    closeIconComponent: {
      control: 'select',
      description: 'Close icon',
      options: Object.keys(icos),
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
  closeIconComponent: CloseIconComponent,
  onClose,
  open: initialOpen,
  primaryButton,
  secondaryButton,
  size,
  testID,
  title,
}: DialogProps) => {
  const [open, setOpen] = useState(initialOpen);
  const SelectedIcon =
    typeof CloseIconComponent === 'string'
      ? icos[CloseIconComponent]
      : CloseIconComponent;

  return (
    <>
      <Dialog
        closeIconComponent={SelectedIcon}
        linkButton={undefined}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
        open={open}
        primaryButton={primaryButton}
        secondaryButton={secondaryButton}
        size={size}
        testID={testID}
        title={title}
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
  closeAriaLabel: 'Close',
  closeIconComponent: IcoClose24,
  onClose: () => {
    console.log('close');
  },
  open: false,
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
  size: 'default',
  testID: 'dialog-test-id',
  title: 'Title',
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
