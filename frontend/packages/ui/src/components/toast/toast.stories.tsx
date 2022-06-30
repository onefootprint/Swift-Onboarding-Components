import { Meta, Story } from '@storybook/react';
import React, { useState } from 'react';

import Box from '../box';
import Button from '../button';
import Toast from './toast';
import type { ToastProps } from './toast.types';
import { useToast } from './toast-provider';

export default {
  component: Toast,
  title: 'Components/Toast',
  argTypes: {
    closeAriaLabel: {
      control: {
        type: 'text',
      },
      type: { name: 'string', required: false },
      description: 'Close button aria-label, for accessibility',
      table: { defaultValue: { summary: 'Close' } },
    },
    variant: {
      control: {
        type: 'select',
      },
      type: { name: 'string', required: false },
      description: 'Toast variant',
      options: ['default', 'error'],
      table: { defaultValue: { summary: 'default' } },
    },
    title: {
      control: {
        type: 'text',
      },
      type: { name: 'string', required: true },
      description: 'Toast title',
    },
    description: {
      control: {
        type: 'text',
      },
      type: { name: 'string', required: true },
      description: 'Toast description',
    },
    testID: {
      control: {
        type: 'text',
      },
      type: { name: 'string', required: false },
      description: 'Append an attribute data-testid for testing purposes',
    },
    onHide: {
      control: {
        type: 'function',
      },
      type: { name: 'function', required: false },
      description: 'Callback when the close button is clicked',
    },
  },
} as Meta;

const Template: Story<ToastProps> = ({
  closeAriaLabel,
  description,
  onHide,
  testID,
  title,
  variant,
}: ToastProps) => {
  const [ids, setIds] = useState<string[]>([]);
  const toast = useToast();

  const handleOpenToast = () => {
    const nextId = toast.show({
      closeAriaLabel,
      description,
      onHide,
      testID,
      title,
      variant,
    });
    setIds(currentIds => [...currentIds, nextId]);
  };

  const handleCloseToast = () => {
    if (ids.length) {
      const lastId = ids[ids.length - 1];
      toast.hide(lastId);
      setIds(currentIds => currentIds.filter(id => id !== lastId));
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 4 }}>
      <Button onClick={handleOpenToast}>Open toast</Button>
      <Button onClick={handleCloseToast}>Close toast</Button>
    </Box>
  );
};

export const Base = Template.bind({});
Base.args = {
  closeAriaLabel: 'Close',
  description: 'Toast description',
  onHide: () => {
    console.log('toast was closed');
  },
  testID: 'input-test-id',
  title: 'Toast title',
  variant: 'default',
};
