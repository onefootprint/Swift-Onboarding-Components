import type { Meta, StoryFn } from '@storybook/react';
import uniqueId from 'lodash/uniqueId';
import Stack from '../stack';
import Text from '../text';
import ScrollArea from './scroll-area';

export default {
  component: ScrollArea,
  title: 'Components/ScrollArea',
  argTypes: {
    hideBottomLine: { control: 'boolean' },
    hideTopLine: { control: 'boolean' },
    padding: { control: 'number' },
    height: { control: 'text' },
    maxHeight: { control: 'text' },
  },
} satisfies Meta<typeof ScrollArea>;

const Template: StoryFn<typeof ScrollArea> = args => (
  <ScrollArea {...args}>
    <Stack direction="column" gap={4}>
      {Array.from({ length: 20 }, (_, i) => (
        <Text key={uniqueId()} variant="body-3">
          Scrollable content item {i + 1}
        </Text>
      ))}
    </Stack>
  </ScrollArea>
);

export const Default = Template.bind({});
Default.args = {
  height: '300px',
  padding: 4,
};

export const HideLines = Template.bind({});
HideLines.args = {
  ...Default.args,
  hideBottomLine: true,
  hideTopLine: true,
};

export const CustomMaxHeight = Template.bind({});
CustomMaxHeight.args = {
  ...Default.args,
  maxHeight: '200px',
};

export const NoOverflow: StoryFn<typeof ScrollArea> = args => (
  <ScrollArea {...args}>
    <Stack direction="column" gap={4}>
      <Text variant="body-3">This content doesn't overflow</Text>
      <Text variant="body-3">So no scrollbar should appear</Text>
    </Stack>
  </ScrollArea>
);
NoOverflow.args = {
  height: '300px',
  padding: 4,
};
