import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import Button from '../button';
import Stack from '../stack';
import AnimatedSuccessCheck from './animated-success-check';

export default {
  title: 'Components/AnimatedSuccessCheck',
  component: AnimatedSuccessCheck,
  argTypes: {
    size: {
      control: 'number',
      defaultValue: 40,
    },
  },
} satisfies Meta<typeof AnimatedSuccessCheck>;

const Template: StoryFn<typeof AnimatedSuccessCheck> = ({ size }) => {
  const [animationStart, setAnimationStart] = useState(false);

  return (
    <Stack dir="column" gap={5}>
      <AnimatedSuccessCheck animationStart={animationStart} size={size} />
      <Stack gap={3}>
        <Button type="button" size="compact" onClick={() => setAnimationStart(true)}>
          Play Animation
        </Button>
        <Button type="button" size="compact" onClick={() => setAnimationStart(false)} variant="secondary">
          Reset Animation
        </Button>
      </Stack>
    </Stack>
  );
};

export const Default = Template.bind({});
Default.args = {
  size: 40,
};
