import type { Meta, StoryFn } from '@storybook/react';
import ConfirmMissingBoDialog from './confirm-missing-bo-dialog';

const Template: StoryFn = () => {
  const onClose = () => console.log('onClose');
  const onSubmit = () => console.log('onSubmit');

  return <ConfirmMissingBoDialog isOpen={true} onClose={onClose} onSubmit={onSubmit} />;
};

export default {
  component: ConfirmMissingBoDialog,
  title: 'NoOtherBosDialog',
} satisfies Meta<typeof ConfirmMissingBoDialog>;

export const Default: StoryFn = () => <Template />;
