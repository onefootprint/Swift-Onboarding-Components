import type { Meta, StoryFn } from '@storybook/react';
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
      type: 'string',
      table: {
        type: { summary: 'string', detail: 'string' },
      },
      description: 'The header text of the bottom sheet',
    },
    closeAriaLabel: {
      type: 'string',
      table: {
        type: { summary: 'string', detail: 'string' },
        defaultValue: { summary: 'Close' },
      },
      description: 'The aria label for the close button',
    },
    children: {
      type: 'string',
      table: {
        type: { summary: 'string', detail: 'string' },
      },
      description: 'The bottom sheet content',
    },
    open: {
      type: 'boolean',
      description: 'Show/Hide the bottom sheet',
      table: {
        type: { summary: 'string', detail: 'string' },
        defaultValue: { summary: 'false' },
      },
    },
    onClose: {
      type: 'function',
      description: 'Function called when the user requests to close the bottom sheet',
      table: {
        type: { summary: 'function', detail: 'string' },
      },
    },
  },
} satisfies Meta<typeof BottomSheet>;

const Template: StoryFn<BottomSheetProps> = ({ children, onClose, open: initialOpen, title }: BottomSheetProps) => {
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
        <Text variant="body-3">{children}</Text>
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

const LinkTemplate: StoryFn<BottomSheetProps> = ({ title, onClose, open: initialVisibility }: BottomSheetProps) => {
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
        <Text variant="body-3">Content</Text>
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
