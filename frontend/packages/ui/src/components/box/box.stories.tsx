import type { ComponentMeta, Story } from '@storybook/react';
import React from 'react';

import Typography from '../typography';
import type { BoxProps } from './box';
import Box from './box';

export default {
  component: Box,
  title: 'Components/Box',
  argTypes: {
    ariaLabel: {
      control: 'text',
      description: 'Aria Label for accessibility',
      name: 'aria-label',
      required: false,
    },
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
    id: {
      control: 'text',
      description: 'Native ID HTML attribute',
    },
    sx: {
      control: 'sx',
      description:
        'Custom object to customize the component using our guidelines',
    },
    testID: {
      control: 'text',
      description: 'data-testid for testing purposes',
    },
  },
} as ComponentMeta<typeof Box>;

const Template: Story<BoxProps> = ({
  ariaLabel,
  as,
  children,
  id,
  testID,
  sx,
}: Partial<BoxProps>) => (
  <Box ariaLabel={ariaLabel} as={as} id={id} testID={testID} sx={sx}>
    <Typography variant="body-1" color="quaternary">
      {children as string}
    </Typography>
  </Box>
);

export const Base = Template.bind({});
Base.args = {
  ariaLabel: '',
  as: 'div',
  children: 'Footprint',
  id: 'box-id',
  testID: 'box-test-id',
  sx: {
    alignItems: 'center',
    backgroundColor: 'tertiary',
    borderRadius: 'default',
    display: 'flex',
    justifyContent: 'center',
    paddingY: 10,
    width: '200px',
  },
};
