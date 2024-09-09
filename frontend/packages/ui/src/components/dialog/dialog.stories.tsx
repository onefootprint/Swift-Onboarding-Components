import { IcoClose24, icos } from '@onefootprint/icons';
import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import Button from '../button';
import Text from '../text';
import type { DialogProps } from './dialog';
import Dialog from './dialog';

export default {
  component: Dialog,
  title: 'Components/Dialog',
  argTypes: {
    title: {
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
      description: 'The header text of the dialog',
    },
    headerIcon: {
      control: 'select',
      description: 'Close icon',
      options: Object.keys(icos),
    },
    onClose: {
      type: 'function',
      description: 'Function called when the user closes the dialog',
      table: {
        type: { summary: 'function' },
      },
    },
    children: {
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
      description: 'The dialog content',
    },
    testID: {
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
      description: 'Append an attribute data-testid for testing purposes',
    },
    open: {
      control: 'boolean',
      description: 'Show/Hide the dialog',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'false' },
      },
    },
    size: {
      control: 'select',
      description: 'The size of the dialog',
      options: ['default', 'compact', 'large', 'full-screen'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    primaryButton: {
      control: 'object',
      description: 'The primary button',
      table: {
        type: { summary: 'object' },
      },
    },
    secondaryButton: {
      control: 'object',
      description: 'The secondary button',
      table: {
        type: { summary: 'object' },
      },
    },
    linkButton: {
      control: 'object',
      description: 'The link button, which is rendered on the left',
      table: {
        type: { summary: 'object' },
      },
    },
    headerButton: {
      control: 'object',
      description: 'The header button, which is rendered on the right of the title',
      table: {
        type: { summary: 'object' },
      },
    },
    isConfirmation: {
      control: 'boolean',
      description: 'Whether the dialog is a confirmation dialog',
      table: {
        type: { summary: 'boolean' },
      },
    },
  },
} satisfies Meta<typeof Dialog>;

const Template: StoryFn<DialogProps> = ({
  children,
  onClose,
  headerIcon: {
    component: HeaderIconComponent = IcoClose24,
    onClick: onHeaderIconClick = onClose,
    ariaLabel: headerIconAriaLabel = 'Close',
  } = {
    component: IcoClose24,
    onClick: onClose,
    ariaLabel: 'Close',
  },
  open: initialOpen,
  primaryButton = { label: 'Primary' },
  secondaryButton = { label: 'Secondary' },
  size,
  testID,
  title,
  isConfirmation,
}: DialogProps) => {
  const [open, setOpen] = useState(initialOpen);
  const SelectedIcon = typeof HeaderIconComponent === 'string' ? icos[HeaderIconComponent] : HeaderIconComponent;

  return (
    <>
      <Dialog
        headerIcon={{
          component: SelectedIcon,
          onClick: () => {
            setOpen(false);
            onHeaderIconClick();
          },
          ariaLabel: headerIconAriaLabel,
        }}
        linkButton={undefined}
        headerButton={undefined}
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
        isConfirmation={isConfirmation}
      >
        <Text variant="body-3">{children}</Text>
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
  headerIcon: {
    component: IcoClose24,
    onClick: () => console.log('close'), // eslint-disable-line no-console
    ariaLabel: 'Close',
  },
  onClose: () => console.log('close'), // eslint-disable-line no-console
  open: false,
  primaryButton: {
    label: 'Primary',
    onClick: () => alert('Primary button clicked'), // eslint-disable-line no-alert
  },
  secondaryButton: {
    label: 'Secondary',
    onClick: () => alert('Secondary button clicked'), // eslint-disable-line no-alert
  },
  size: 'default',
  testID: 'dialog-test-id',
  title: 'Title',
  isConfirmation: false,
};

const OnlyPrimaryTemplate: StoryFn<DialogProps> = ({
  children,
  onClose,
  headerIcon: {
    component: HeaderIconComponent = IcoClose24,
    onClick: onHeaderIconClick = onClose,
    ariaLabel: headerIconAriaLabel = 'Close',
  } = {
    component: IcoClose24,
    onClick: onClose,
    ariaLabel: 'Close',
  },
  open: initialOpen,
  primaryButton = { label: 'Primary' },
  size,
  testID,
  title,
  isConfirmation,
}: DialogProps) => {
  const [open, setOpen] = useState(initialOpen);
  const SelectedIcon = typeof HeaderIconComponent === 'string' ? icos[HeaderIconComponent] : HeaderIconComponent;

  return (
    <>
      <Dialog
        linkButton={undefined}
        headerButton={undefined}
        headerIcon={{
          component: SelectedIcon,
          onClick: onHeaderIconClick,
          ariaLabel: headerIconAriaLabel,
        }}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
        open={open}
        primaryButton={primaryButton}
        size={size}
        testID={testID}
        title={title}
        isConfirmation={isConfirmation}
      >
        <Text variant="body-3">{children}</Text>
      </Dialog>
      <Button onClick={() => setOpen(true)} size="default">
        Open dialog
      </Button>
    </>
  );
};

export const OnlyPrimary = OnlyPrimaryTemplate.bind({});
OnlyPrimary.args = {
  open: false,
  size: 'default',
  title: 'Title',
  primaryButton: {
    label: 'Primary',
  },
  onClose: () => {
    console.log('close'); // eslint-disable-line no-console
  },
  isConfirmation: false,
};

const LinkTemplate: StoryFn<DialogProps> = ({
  title,
  onClose,
  primaryButton = { label: 'Primary' },
  linkButton = { label: 'Link' },
  size,
  testID,
  isConfirmation = false,
  open: initialVisibility,
}: DialogProps) => {
  const [open, setOpen] = useState(initialVisibility);

  return (
    <>
      <Dialog
        title={title}
        headerIcon={{}}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
        primaryButton={primaryButton}
        linkButton={linkButton}
        secondaryButton={undefined}
        headerButton={undefined}
        size={size}
        testID={testID}
        open={open}
        isConfirmation={isConfirmation}
      >
        <Text variant="body-3">Content</Text>
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
    console.log('close'); // eslint-disable-line no-console
  },
};
