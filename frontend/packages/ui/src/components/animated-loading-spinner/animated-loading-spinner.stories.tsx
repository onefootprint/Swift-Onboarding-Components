import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React, { useState } from 'react';

import Button from '../button';
import Stack from '../stack';
import AnimatedLoadingSpinner from './animated-loading-spinner';

export default {
  title: 'Components/AnimatedLoadingSpinner',
  component: AnimatedLoadingSpinner,
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
} as ComponentMeta<typeof AnimatedLoadingSpinner>;

const Template: ComponentStory<typeof AnimatedLoadingSpinner> = ({ size, color }) => {
  const [animationStart, setAnimationStart] = useState(false);

  return (
    <Stack dir="column" gap={5}>
      <AnimatedLoadingSpinner animationStart={animationStart} size={size} color={color} />
      <Stack gap={3}>
        <Button type="button" size="compact" onClick={() => setAnimationStart(true)}>
          Start Animation
        </Button>
        <Button type="button" size="compact" onClick={() => setAnimationStart(false)} variant="secondary">
          Stop Animation
        </Button>
      </Stack>
    </Stack>
  );
};

export const Default = Template.bind({});
Default.args = {
  size: 40,
};
