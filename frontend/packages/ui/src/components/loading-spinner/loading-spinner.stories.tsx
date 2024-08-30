import type { Meta, StoryFn } from '@storybook/react';
import Stack from '../stack';
import LoadingSpinner from './loading-spinner';

export default {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
  argTypes: {
    size: {
      control: 'number',
      defaultValue: 40,
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'quaternary'],
    },
  },
} satisfies Meta<typeof LoadingSpinner>;

const Template: StoryFn<typeof LoadingSpinner> = ({ size, color }) => {
  return (
    <Stack dir="column" gap={5}>
      <LoadingSpinner size={size} color={color} />
    </Stack>
  );
};

export const Default = Template.bind({});
Default.args = {
  size: 40,
};
