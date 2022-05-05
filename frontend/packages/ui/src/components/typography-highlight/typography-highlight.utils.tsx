import React from 'react';
import type { Colors, Typographies } from 'styled';

import Typography from '../typography';

export const getMatchJsx = ({
  color,
  highlightedColor,
  end,
  matchedText,
  start,
  text,
  variant,
  highlightedVariant,
}: {
  text: string;
  matchedText: { length: number; offset: number };
  start: number;
  end: number;
  color: Colors;
  highlightedColor: Colors;
  variant: Typographies;
  highlightedVariant: Typographies;
}): React.ReactNode => {
  const highlightTextStart = matchedText.offset;
  const highlightTextEnd = highlightTextStart + matchedText.length;
  const beforeText = text.slice(start, highlightTextStart);
  const highlightedText = text.slice(highlightTextStart, highlightTextEnd);
  const afterText = text.slice(highlightTextEnd, end || text.length);
  return [
    beforeText ? (
      <Typography
        as="p"
        color={color}
        display="inline"
        key={beforeText}
        variant={variant}
      >
        {beforeText}
      </Typography>
    ) : null,
    <Typography
      as="p"
      color={highlightedColor}
      display="inline"
      key={text}
      variant={highlightedVariant}
    >
      {highlightedText}
    </Typography>,
    afterText ? (
      <Typography
        as="p"
        color={color}
        display="inline"
        key={afterText}
        variant={variant}
      >
        {afterText}
      </Typography>
    ) : null,
  ];
};

export const highlightSearchedText = ({
  text,
  matchedText,
  color,
  highlightedColor,
  variant,
  highlightedVariant,
}: {
  text: string;
  matchedText: { length: number; offset: number }[];
  color: Colors;
  highlightedColor: Colors;
  variant: Typographies;
  highlightedVariant: Typographies;
}): React.ReactNode => {
  const returnText = [];
  for (let i = 0; i < matchedText.length; i += 1) {
    const startOfNext = matchedText[i + 1]?.offset;
    if (i === 0) {
      returnText.push(
        getMatchJsx({
          color,
          highlightedColor,
          end: startOfNext,
          matchedText: matchedText[i],
          start: 0,
          text,
          variant,
          highlightedVariant,
        }),
      );
    } else {
      returnText.push(
        getMatchJsx({
          color,
          highlightedColor,
          end: startOfNext,
          matchedText: matchedText[i],
          start: matchedText[i].offset,
          text,
          variant,
          highlightedVariant,
        }),
      );
    }
  }
  return returnText;
};
