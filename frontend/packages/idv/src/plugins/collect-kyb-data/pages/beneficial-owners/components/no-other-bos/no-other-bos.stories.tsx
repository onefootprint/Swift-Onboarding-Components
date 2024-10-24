import type { Meta, StoryFn } from '@storybook/react';
import NoOtherBosDialog from './no-other-bos';

const Template: StoryFn = () => {
  const onClose = () => console.log('onClose');
  const onSubmit = () => console.log('onSubmit');

  return <NoOtherBosDialog isOpen={true} onClose={onClose} onSubmit={onSubmit} />;
};

export default {
  component: NoOtherBosDialog,
  title: 'NoOtherBosDialog',
} satisfies Meta<typeof NoOtherBosDialog>;

export const Default: StoryFn = () => <Template />;
