import { primitives } from '@onefootprint/design-tokens';
import type { Meta, StoryFn } from '@storybook/react';

import Box from './box';
import type { BoxProps } from './box.types';

export default {
  component: Box,
  title: 'Components/Box',
  argTypes: {
    as: {
      control: 'select',
      options: ['div', 'span', 'section', 'article', 'main', 'aside'],
      description: 'Renders another HTML Tag, instead of the div',
      table: { defaultValue: { summary: 'div' } },
      required: false,
    },
    children: {
      control: 'text',
      description: 'Content (React Node)',
      name: 'children *',
    },
    backgroundColor: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'quaternary', 'transparent'],
      description: 'Background color',
      table: { defaultValue: { summary: 'transparent' } },
    },
    borderPosition: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left', 'all'],
      description: 'Border position',
    },
    borderRadius: {
      control: 'select',
      options: Object.keys(primitives.borderRadius),
    },
    borderWidth: {
      control: 'select',
      options: Object.keys(primitives.borderWidth),
    },
    borderColor: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'quaternary'],
    },
    position: {
      control: 'select',
      options: ['relative', 'absolute', 'fixed', 'sticky'],
    },
    display: {
      control: 'select',
      options: ['block', 'flex', 'inline-block', 'inline-flex'],
    },
    textAlign: {
      control: 'select',
      options: ['left', 'center', 'right'],
    },
    fontStyle: {
      control: 'select',
      options: Object.keys(primitives.typography),
    },
    elevation: {
      control: 'select',
      options: [0, 1, 2, 3],
    },
    visibility: {
      control: 'select',
      options: ['visible', 'hidden'],
    },
    padding: {
      control: 'select',
      options: Object.keys(primitives.spacing),
    },
    margin: {
      control: 'select',
      options: Object.keys(primitives.spacing),
    },
    paddingTop: {
      control: 'select',
      options: Object.keys(primitives.spacing),
    },
    paddingBottom: {
      control: 'select',
      options: Object.keys(primitives.spacing),
    },
    paddingLeft: {
      control: 'select',
      options: Object.keys(primitives.spacing),
    },
    paddingRight: {
      control: 'select',
      options: Object.keys(primitives.spacing),
    },
    marginTop: {
      control: 'select',
      options: Object.keys(primitives.spacing),
    },
    marginBottom: {
      control: 'select',
      options: Object.keys(primitives.spacing),
    },
    marginLeft: {
      control: 'select',
      options: Object.keys(primitives.spacing),
    },
    marginRight: {
      control: 'select',
      options: Object.keys(primitives.spacing),
    },
    overflow: {
      control: 'select',
      options: ['visible', 'hidden', 'scroll', 'auto'],
    },
  },
} satisfies Meta<typeof Box>;

// eslint-disable-next-line react/jsx-props-no-spreading
const Template: StoryFn<BoxProps> = args => <Box {...args} />;
export const Default = Template.bind({});
Default.args = {
  children: 'Box',
};
