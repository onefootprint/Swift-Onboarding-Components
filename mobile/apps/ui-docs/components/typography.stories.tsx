import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react-native';
import { Typography } from '@onefootprint/ui';
import themes from '@onefootprint/design-tokens';

const TypographyMeta: ComponentMeta<typeof Typography> = {
  title: 'Typography',
  component: Typography,
  argTypes: {
    children: {
      control: 'text',
    },
    ellipsizeMode: {
      control: 'select',
      options: ['head', 'middle', 'tail', 'clip', undefined],
    },
    numberOfLines: {
      control: 'number',
    },
    color: {
      control: 'select',
      options: Object.keys(themes.light.color),
    },
    variant: {
      control: 'select',
      options: [
        'display-1',
        'display-2',
        'display-3',
        'heading-1',
        'heading-2',
        'heading-3',
        'body-1',
        'body-2',
        'body-3',
        'label-1',
        'label-2',
        'label-3',
        'caption-1',
        'caption-2',
      ],
    },
    center: {
      control: 'boolean',
    },
  },
  args: {
    center: false,
    children: 'Footprint',
    color: 'primary',
    ellipsizeMode: undefined,
    numberOfLines: 1,
    variant: 'body-1',
  },
};

export default TypographyMeta;

type TypographyStory = ComponentStory<typeof Typography>;

export const Basic: TypographyStory = args => <Typography {...args} />;
