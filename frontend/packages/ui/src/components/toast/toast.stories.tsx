import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import Button from '../button';
import Stack from '../stack';
import Toast from './toast';
import { useToast } from './toast-provider';
import type { ToastProps } from './toast.types';

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
    cta: {
      control: {
        type: 'object',
      },
      type: { name: 'string', required: true },
      description: 'Toast cta',
    },
    testID: {
      control: {
        type: 'text',
      },
      type: { name: 'string', required: false },
      description: 'Append an attribute data-testid for testing purposes',
    },
    onClose: {
      type: { name: 'function', required: false },
      description: 'Callback when the close button is clicked',
    },
  },
} satisfies Meta<typeof Toast>;

const Template: StoryFn<ToastProps> = ({
  cta,
  closeAriaLabel,
  description,
  onClose,
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
      onClose,
      testID,
      title,
      variant,
      cta,
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
    <Stack gap={4}>
      <Button onClick={handleOpenToast}>Open toast</Button>
      <Button onClick={handleCloseToast}>Close toast</Button>
    </Stack>
  );
};

export const Base = Template.bind({});
Base.args = {
  closeAriaLabel: 'Close',
  description: 'Toast description',
  onClose: () => {
    console.log('toast was closed'); // eslint-disable-line no-console
  },
  testID: 'input-test-id',
  title: 'Toast title',
  variant: 'default',
  cta: {
    label: 'Continue',
    onClick: () => {
      console.log('cta was clicked'); // eslint-disable-line no-console
    },
  },
};
