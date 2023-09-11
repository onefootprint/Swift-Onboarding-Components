import type { BackgroundColor, Color } from '@onefootprint/design-tokens';
import themes from '@onefootprint/design-tokens';
import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import type { InlineAlertProps } from './inline-alert';
import InlineAlert from './inline-alert';

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
      color: Color;
    };
  }[] = [
    {
      variant: 'error',
      styles: { backgroundColor: 'error', color: 'error' },
    },
    {
      variant: 'info',
      styles: { backgroundColor: 'info', color: 'info' },
    },
    {
      variant: 'warning',
      styles: { backgroundColor: 'warning', color: 'warning' },
    },
  ];
  describe.each(variants)(
    'when is the variant $variant',
    ({ variant, styles }) => {
      it('should render with the correct styles', () => {
        renderInlineAlert({ children: 'alert content', variant });
        expect(screen.getByText('alert content')).toHaveStyle({
          backgroundColor: themes.light.backgroundColor[styles.backgroundColor],
          color: themes.light.color[styles.color],
        });
      });
    },
  );
});
