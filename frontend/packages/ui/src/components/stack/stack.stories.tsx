import type { StoryFn } from '@storybook/react';
import type { StackProps } from './stack';
import Stack from './stack';

export default {
  component: Stack,
  title: 'Components/Stack',
  argTypes: {
    direction: {
      control: {
        options: ['row', 'column'],
        type: 'select',
      },
      description: 'Flex direction',
      name: 'direction',
    },
    gap: {
      control: 'number',
      description: 'Gap between children as spacing token',
      name: 'Gap',
    },
    align: {
      description: 'alignItems',
      name: 'align',
      control: {
        options: ['center', 'flex-start', 'flex-end', 'stretch', 'unset'],
        type: 'select',
      },
    },
    justify: {
      description: 'Justify content',
      name: 'justify',
      control: {
        options: ['center', 'flex-start', 'flex-end', 'space-between', 'space-around', 'unset'],
        type: 'select',
      },
    },
    flexWrap: {
      control: 'boolean',
      description: 'Wrap children',
      name: 'Wrap children',
    },
  },
};

const Template: StoryFn<StackProps> = ({ gap, direction, align, justify, flexWrap }) => (
  <Stack gap={gap} direction={direction} align={align} justify={justify} flexWrap={flexWrap}>
    <div>😊</div>
    <div>🤠</div>
    <div>😎</div>
  </Stack>
);

export const Default = Template.bind({});
