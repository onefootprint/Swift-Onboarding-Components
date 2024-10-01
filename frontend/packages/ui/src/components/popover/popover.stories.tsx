import type { Meta, StoryFn } from '@storybook/react';
import Stack from '../stack';
import Text from '../text';
import Popover from './popover';
import type { PopoverProps } from './popover';

export default {
  component: Popover,
  title: 'Components/Popover',
  argTypes: {
    content: {
      control: 'text',
      description: 'The content of the popover',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
  },
} satisfies Meta<typeof Popover>;

const PopoverContent = () => {
  return (
    <Stack direction="column">
      <Text variant="label-3">Popover content</Text>
      <Text variant="body-3">Popover content</Text>
    </Stack>
  );
};

const Template: StoryFn<PopoverProps> = () => {
  return (
    <Stack justify="center" align="center" width="100vw" height="100vh">
      <Popover content={<PopoverContent />}>
        <Text variant="body-3" color="primary">
          Open Popover
        </Text>
      </Popover>
    </Stack>
  );
};

export const Default = Template.bind({});
Default.args = {};
