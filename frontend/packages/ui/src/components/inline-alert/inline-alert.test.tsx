import React from 'react';
import { customRender, screen } from 'test-utils';
import type { BackgroundColor, BorderColor } from 'themes';
import themes from 'themes';

import InlineAlert, { InlineAlertProps } from './inline-alert';

describe('<InlineAlert />', () => {
  const renderInlineAlert = ({
    children = 'alert content',
    variant = 'warning',
  }: Partial<InlineAlertProps>) =>
    customRender(<InlineAlert variant={variant}>{children}</InlineAlert>);

  it('should assign a role alert', () => {
    renderInlineAlert({ children: 'alert content' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render the text', () => {
    renderInlineAlert({ children: 'alert content' });
    expect(screen.getByText('alert content')).toBeInTheDocument();
  });

  const variants: {
    variant: InlineAlertProps['variant'];
    styles: {
      backgroundColor: BackgroundColor;
      borderColor: BorderColor;
    };
  }[] = [
    {
      variant: 'error',
      styles: { backgroundColor: 'error', borderColor: 'error' },
    },
    {
      variant: 'info',
      styles: { backgroundColor: 'secondary', borderColor: 'tertiary' },
    },
    {
      variant: 'warning',
      styles: { backgroundColor: 'warning', borderColor: 'primary' },
    },
  ];
  describe.each(variants)(
    'when is the variant $variant',
    ({ variant, styles }) => {
      it('should render with the correct styles', () => {
        renderInlineAlert({ children: 'alert content', variant });
        expect(screen.getByText('alert content')).toHaveStyle({
          backgroundColor: themes.light.backgroundColor[styles.backgroundColor],
          borderColor: themes.light.borderColor[styles.borderColor],
        });
      });
    },
  );
});
