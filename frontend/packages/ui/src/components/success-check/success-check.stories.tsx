import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React, { useState } from 'react';

import Button from '../button';
import Stack from '../stack';
import SuccessCheck from './success-check';

export default {
  title: 'Components/SuccessCheck',
  component: SuccessCheck,
  argTypes: {
    size: {
      control: 'number',
      defaultValue: 40,
    },
  },
} as ComponentMeta<typeof SuccessCheck>;

const Template: ComponentStory<typeof SuccessCheck> = ({ size }) => {
  const [animationStart, setAnimationStart] = useState(false);

  return (
    <Stack direction="column" gap={5}>
      <SuccessCheck animationStart={animationStart} size={size} />
      <Stack gap={3}>
        <Button
          type="button"
          size="small"
          onClick={() => setAnimationStart(true)}
        >
          Play Animation
        </Button>
        <Button
          type="button"
          size="small"
          onClick={() => setAnimationStart(false)}
          variant="secondary"
        >
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
