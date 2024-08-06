import type { Meta, Story } from '@storybook/react';
import { useState } from 'react';

import Button from '../button';
import Text from '../text';
import type { BottomSheetProps } from './bottom-sheet';
import BottomSheet from './bottom-sheet';

export default {
  component: BottomSheet,
  title: 'Components/BottomSheet',
  argTypes: {
    title: {
      control: 'text',
      table: {
        type: { summary: 'string', required: true },
      },
      description: 'The header text of the bottom sheet',
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
      description: 'The bottom sheet content',
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
      description: 'Show/Hide the bottom sheet',
      table: {
        type: { summary: 'string', required: false },
        defaultValue: { summary: 'false' },
      },
    },
    onClose: {
      control: 'function',
      description: 'Function called when the user requests to close the bottom sheet',
      table: {
        type: { summary: 'function', required: false },
      },
    },
  },
} as Meta;

const Template: Story<BottomSheetProps> = ({ children, onClose, open: initialOpen, title }: BottomSheetProps) => {
  const [open, setOpen] = useState(initialOpen);

  return (
    <>
      <BottomSheet
        onClose={() => {
          setOpen(false);
          onClose?.();
        }}
        open={open}
        title={title}
      >
        <Text variant="body-4">{children}</Text>
      </BottomSheet>
      <Button onClick={() => setOpen(true)}>Open bottom sheet</Button>
    </>
  );
};

export const Base = Template.bind({});
Base.args = {
  children: 'Content',
  closeAriaLabel: 'Close',
  onClose: () => {
    console.log('close'); // eslint-disable-line no-console
  },
  open: false,
  title: 'Title',
};

export const OnlyPrimary = Template.bind({});
OnlyPrimary.args = {
  open: false,
  title: 'Title',
  onClose: () => {
    console.log('close'); // eslint-disable-line no-console
  },
};

const LinkTemplate: Story<BottomSheetProps> = ({ title, onClose, open: initialVisibility }: BottomSheetProps) => {
  const [open, setOpen] = useState(initialVisibility);

  return (
    <>
      <BottomSheet
        title={title}
        onClose={() => {
          setOpen(false);
          onClose?.();
        }}
        open={open}
      >
        <Text variant="body-4">Content</Text>
      </BottomSheet>
      <Button onClick={() => setOpen(true)}>Open bottom sheet</Button>
    </>
  );
};

export const PrimaryAndLink = LinkTemplate.bind({});
PrimaryAndLink.args = {
  open: false,
  title: 'Title',
  onClose: () => {
    console.log('close'); // eslint-disable-line no-console
  },
};
