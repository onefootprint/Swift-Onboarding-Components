import themes from '@onefootprint/design-tokens';
import type { Meta, StoryFn } from '@storybook/react';

import type { TextProps } from './text';
import Text from './text';
import variantMapping from './text.constants';

export default {
  title: 'Components/Text',
  component: Text,
  argTypes: {
    tag: {
      control: 'select',
      options: ['p', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'span'],
    },
    color: {
      control: 'select',
      options: Object.keys(themes.light.color),
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
    variant: { control: 'select', options: Object.keys(variantMapping) },
  },
} as Meta;

const Template: StoryFn<TextProps> = ({
  tag,
  children = 'lorem',
  color = 'primary',
  testID,
  variant = 'heading-1',
}: Partial<TextProps>) => (
  <Text tag={tag} color={color} testID={testID} variant={variant}>
    {children}
  </Text>
);

export const Display1 = Template.bind({});
Display1.args = {
  variant: 'display-1',
  children: 'Footprint (display-1)',
  color: 'error',
};

Display1.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/Orjo4h0SCkeI4YBu0cQkab/Foundations?node-id=0%3A1',
  },
};

export const Display2 = Template.bind({});
Display2.args = {
  variant: 'display-2',
  children: 'Footprint (display-2)',
};

export const Display3 = Template.bind({});
Display3.args = {
  variant: 'display-3',
  children: 'Footprint (display-3)',
};

export const Heading1 = Template.bind({});
Heading1.args = {
  variant: 'heading-1',
  children: 'Footprint (heading-1)',
};

export const Heading2 = Template.bind({});
Heading2.args = {
  variant: 'heading-2',
  children: 'Footprint (heading-2)',
};

export const Heading3 = Template.bind({});
Heading3.args = {
  tag: 'p',
  children: 'Footprint (heading-3)',
  color: 'primary',
  testID: 'text-test-id',
  variant: 'heading-3',
};

export const Body1 = Template.bind({});
Body1.args = {
  variant: 'body-1',
  children: 'Footprint (body-1)',
};

export const Body2 = Template.bind({});
Body2.args = {
  variant: 'body-2',
  children: 'Footprint (body-2)',
};

export const Body3 = Template.bind({});
Body3.args = {
  variant: 'body-3',
  children: 'Footprint (body-3)',
};

export const Body4 = Template.bind({});
Body4.args = {
  variant: 'body-4',
  children: 'Footprint (body-4)',
};

export const Label1 = Template.bind({});
Label1.args = {
  variant: 'label-1',
  children: 'Footprint (label-1)',
};

export const Label2 = Template.bind({});
Label2.args = {
  variant: 'label-2',
  children: 'Footprint (label-2)',
};

export const Label3 = Template.bind({});
Label3.args = {
  variant: 'label-3',
  children: 'Footprint (label-3)',
};

export const Label4 = Template.bind({});
Label4.args = {
  variant: 'label-4',
  children: 'Footprint (label-4)',
};

export const Caption1 = Template.bind({});
Caption1.args = {
  variant: 'caption-1',
  children: 'Footprint (caption-1)',
};

export const Caption2 = Template.bind({});
Caption2.args = {
  variant: 'caption-2',
  children: 'Footprint (caption-2)',
};
