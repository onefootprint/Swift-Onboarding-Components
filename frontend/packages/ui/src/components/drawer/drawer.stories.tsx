import { IcoClose24, icos } from '@onefootprint/icons';
import type { Meta, Story } from '@storybook/react';
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
        type: { summary: 'string', required: true },
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
      description: 'The drawer content',
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
      description: 'Show/Hide the drawer',
      table: {
        type: { summary: 'string', required: false },
        defaultValue: { summary: 'false' },
      },
    },
    onClose: {
      control: 'function',
      description: 'Function called when the user requests to close the drawer',
      table: {
        type: { summary: 'function', required: false },
      },
    },
    onClickOutside: {
      control: 'function',
      description:
        'Function called when the user clicks anywhere outside the drawer (in case this functionality is different than onClose)',
      table: {
        type: { summary: 'function', required: false },
      },
    },
  },
} as Meta;

const Template: Story<DrawerProps> = ({
  children,
  closeIconComponent: CloseIconComponent,
  onClose,
  open: initialOpen,
  title,
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
      >
        <Text variant="body-4">{children}</Text>
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
