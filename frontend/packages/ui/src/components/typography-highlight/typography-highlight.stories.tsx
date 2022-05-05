import { ComponentMeta, Story } from '@storybook/react';
import React from 'react';

import light from '../../config/themes/light';
import TypographyHighlight, {
  TypographyHighlightProps,
} from './typography-highlight';
import variantMapping from './typography-highlight.constants';

export default {
  title: 'Components/TypographyHighlight',
  argTypes: {
    color: {
      control: 'select',
      description: 'Color for the part of the text NOT highlighted',
      options: Object.keys(light.colors),
      table: { defaultValue: { summary: 'secondary' } },
    },
    highlightedColor: {
      control: 'select',
      description: 'Color for the part of the highlighted',
      options: Object.keys(light.colors),
      table: { defaultValue: { summary: 'primary' } },
    },
    variant: {
      control: 'select',
      description: 'Variant for the part of the text NOT highlighted',
      options: Object.keys(variantMapping),
      table: { defaultValue: { summary: 'body-3' } },
    },
    highlightedVariant: {
      control: 'select',
      description: 'Variant for the part of the text highlighted',
      options: Object.keys(variantMapping),
      table: { defaultValue: { summary: 'label-3' } },
    },
    children: {
      control: 'text',
      description: 'Text content',
      name: 'children *',
    },
    matchedText: {
      control: 'object',
      description: 'Array with offset and length of the matched string',
      name: 'matchedText *',
    },
  },
  component: TypographyHighlight,
} as ComponentMeta<typeof TypographyHighlight>;

const Template: Story<TypographyHighlightProps> = ({
  color,
  highlightedColor,
  matchedText,
  children,
  variant,
  highlightedVariant,
}: TypographyHighlightProps) => (
  <TypographyHighlight
    color={color}
    highlightedColor={highlightedColor}
    matchedText={matchedText}
    variant={variant}
    highlightedVariant={highlightedVariant}
  >
    {children}
  </TypographyHighlight>
);

export const Base = Template.bind({});
Base.args = {
  children: '158 West 23 Street',
  color: 'secondary',
  highlightedColor: 'primary',
  matchedText: [{ offset: 0, length: 10 }],
  variant: 'body-3',
  highlightedVariant: 'label-3',
};
