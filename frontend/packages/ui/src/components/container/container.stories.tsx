import { ComponentMeta, Story } from '@storybook/react';
import React from 'react';

import Box from '../box';
import Typography from '../typography';
import Container, { ContainerProps } from './container';

export default {
  title: 'Components/Container',
  component: Container,
  argTypes: {
    children: {
      control: 'text',
      description: 'Content to be rendered within the component',
      name: 'Children *',
      required: true,
    },
    as: {
      control: 'select',
      options: ['div', 'section', 'article', 'main'],
      table: { defaultValue: { summary: 'div' } },
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as ComponentMeta<typeof Container>;

const Template: Story<ContainerProps> = ({
  as,
  children,
  testID,
}: Partial<ContainerProps>) => (
  <Container as={as} testID={testID}>
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'tertiary',
        height: '100vh',
        borderRadius: 1,
        padding: 6,
      }}
    >
      <Typography variant="label-1" color="quaternary">
        {children}
      </Typography>
    </Box>
  </Container>
);

export const Base = Template.bind({});
Base.args = {
  as: 'div',
  children: 'Some content',
  testID: 'container-test-id',
};
