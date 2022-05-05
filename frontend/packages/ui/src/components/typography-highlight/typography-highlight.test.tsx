import React from 'react';
import { customRender, screen } from 'test-utils';

import themes from '../../config/themes';
import TypographyHighlight, {
  TypographyHighlightProps,
} from './typography-highlight';

describe('<Typography />', () => {
  const renderTypographyHighlight = ({
    children = 'this is the searched text',
    color,
    highlightedColor,
    highlightedVariant,
    matchedText = [{ length: 5, offset: 1 }],
    variant,
  }: Partial<TypographyHighlightProps>) => {
    customRender(
      <TypographyHighlight
        color={color}
        highlightedColor={highlightedColor}
        highlightedVariant={highlightedVariant}
        matchedText={matchedText}
        variant={variant}
      >
        {children}
      </TypographyHighlight>,
    );
  };

  it('should mark the text indicated text', () => {
    renderTypographyHighlight({
      children: 'Lorem ipsum dolor',
      highlightedColor: 'error',
      highlightedVariant: 'heading-1',
      matchedText: [{ length: 5, offset: 1 }],
    });
    const highlightedText = screen.getByText('orem');
    expect(highlightedText).toBeInTheDocument();
    expect(highlightedText).toHaveStyle({
      color: themes.light.colors.error,
    });
    expect(highlightedText).toHaveStyle({
      fontFamily: themes.light.typographies['heading-1'].fontFamily,
    });
  });

  const nonMatchedTexts = [
    { text: 'L', context: 'before' },
    { text: 'ipsum dolor', context: 'after' },
  ];
  it.each(nonMatchedTexts)(
    `should not mark the $text, located $context the highlighted text`,
    value => {
      renderTypographyHighlight({
        children: 'Lorem ipsum dolor',
        color: 'accent',
        matchedText: [{ length: 5, offset: 1 }],
        variant: 'body-4',
      });
      const noHighlightedText = screen.getByText(value.text);
      expect(noHighlightedText).toBeInTheDocument();
      expect(noHighlightedText).toHaveStyle({
        color: themes.light.colors.accent,
      });
      expect(noHighlightedText).toHaveStyle({
        fontFamily: themes.light.typographies['body-4'].fontFamily,
      });
    },
  );
});
