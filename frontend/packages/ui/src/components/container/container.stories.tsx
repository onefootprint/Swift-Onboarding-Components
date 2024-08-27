import type { Meta, StoryFn } from '@storybook/react';

import Box from '../box';
import Text from '../text';
import type { ContainerProps } from './container';
import Container from './container';

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
    tag: {
      control: 'select',
      options: ['div', 'section', 'article', 'main'],
      table: { defaultValue: { summary: 'div' } },
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} satisfies Meta<typeof Container>;

const Template: StoryFn<ContainerProps> = ({ as, children, testID }: Partial<ContainerProps>) => (
  <Container as={as} testID={testID}>
    <Box width="100%" height="100vh" backgroundColor="tertiary" borderRadius="sm" padding={6}>
      <Text variant="label-1" color="quaternary">
        {children}
      </Text>
    </Box>
  </Container>
);

export const Base = Template.bind({});
Base.args = {
  tag: 'div',
  children: 'Some content',
  testID: 'container-test-id',
};
