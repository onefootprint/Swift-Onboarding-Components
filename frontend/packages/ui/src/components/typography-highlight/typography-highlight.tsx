import React from 'react';
import type { Colors, Typographies } from 'styled';

import { highlightSearchedText } from './typography-highlight.utils';

export type TypographyHighlightProps = {
  children: string;
  color?: Colors;
  highlightedColor?: Colors;
  matchedText: { length: number; offset: number }[];
  variant?: Typographies;
  highlightedVariant?: Typographies;
};

const TypographyHighlight = ({
  children,
  color = 'secondary',
  highlightedColor = 'primary',
  matchedText,
  variant = 'body-3',
  highlightedVariant = 'label-3',
}: TypographyHighlightProps) => (
  <>
    {highlightSearchedText({
      color,
      highlightedColor,
      matchedText,
      text: children,
      variant,
      highlightedVariant,
    })}
  </>
);

export default TypographyHighlight;
