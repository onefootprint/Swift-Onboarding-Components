import { IcoClose24, icos } from '@onefootprint/icons';
import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import Button from '../button';
import Text from '../text';
import type { DrawerProps } from './drawer';
import Drawer from './drawer';

export default {
  component: Drawer,
  title: 'Components/Drawer',
  argTypes: {
    title: {
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
      description: 'The header text of the drawer',
    },
    closeIconComponent: {
      control: 'select',
      description: 'Close icon',
      options: Object.keys(icos),
    },
    closeAriaLabel: {
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Close' },
      },
      description: 'The aria label for the close button',
    },
    children: {
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
      description: 'The drawer content',
    },
    open: {
      control: 'boolean',
      description: 'Show/Hide the drawer',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'false' },
      },
    },
    onClose: {
      type: 'function',
      description: 'Function called when the user requests to close the drawer',
      table: {
        type: { summary: 'function' },
      },
    },
    onClickOutside: {
      type: 'function',
      description:
        'Function called when the user clicks anywhere outside the drawer (in case this functionality is different than onClose)',
      table: {
        type: { summary: 'function' },
      },
    },
    primaryButton: {
      control: 'object',
      description: 'Primary',
      table: {
        type: { summary: 'object' },
      },
    },
    secondaryButton: {
      control: 'object',
      description: 'Secondary ',
      table: {
        type: { summary: 'object' },
      },
    },
    linkButton: {
      control: 'object',
      description: 'Link',
      table: {
        type: { summary: 'object' },
      },
    },
  },
} satisfies Meta<typeof Drawer>;

const Template: StoryFn<DrawerProps> = ({
  children,
  closeIconComponent: CloseIconComponent,
  onClose,
  open: initialOpen,
  title,
  primaryButton,
  secondaryButton,
  linkButton,
}: DrawerProps) => {
  const [open, setOpen] = useState(initialOpen);
  const SelectedIcon = typeof CloseIconComponent === 'string' ? icos[CloseIconComponent] : CloseIconComponent;

  return (
    <>
      <Drawer
        closeIconComponent={SelectedIcon}
        onClose={() => {
          setOpen(false);
          onClose();
        }}
        open={open}
        title={title}
        primaryButton={primaryButton}
        secondaryButton={secondaryButton}
        linkButton={linkButton}
      >
        <Text variant="body-3">{children}</Text>
      </Drawer>
      <Button onClick={() => setOpen(true)}>Open Drawer</Button>
    </>
  );
};

export const Base = Template.bind({});
Base.args = {
  children: 'Content',
  closeAriaLabel: 'Close',
  closeIconComponent: IcoClose24,
  onClose: () => {
    console.log('close'); // eslint-disable-line no-console
  },
  onClickOutside: () => {
    console.log('clicked outside'); // eslint-disable-line no-console
  },
  open: false,
  title: 'Title',
};

export const WithFooter = Template.bind({});
WithFooter.args = {
  children: 'Content with footer',
  closeAriaLabel: 'Close',
  closeIconComponent: IcoClose24,
  onClose: () => {
    console.log('close'); // eslint-disable-line no-console
  },
  onClickOutside: () => {
    console.log('clicked outside'); // eslint-disable-line no-console
  },
  open: false,
  title: 'Title with Buttons',
  primaryButton: {
    label: 'Primary',
    onClick: () => {
      console.log('Primary button clicked'); // eslint-disable-line no-console
    },
  },
  secondaryButton: {
    label: 'Secondary',
    onClick: () => {
      console.log('Secondary button clicked'); // eslint-disable-line no-console
    },
  },
  linkButton: {
    label: 'Link',
    onClick: () => {
      console.log('Link button clicked'); // eslint-disable-line no-console
    },
  },
};
