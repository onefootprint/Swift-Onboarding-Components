import React from 'react';
import { customRender, screen } from 'test-utils';
import type { BackgroundColor, BorderColor } from 'themes';
import themes from 'themes';

import InlineBanner, { InlineBannerProps } from './inline-banner';

describe('<InlineBanner />', () => {
  const renderInlineBanner = ({
    children = 'banner content',
    variant = 'warning',
  }: Partial<InlineBannerProps>) =>
    customRender(<InlineBanner variant={variant}>{children}</InlineBanner>);

  it('should assign a role alert', () => {
    renderInlineBanner({ children: 'banner content' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render the text', () => {
    renderInlineBanner({ children: 'banner content' });
    expect(screen.getByText('banner content')).toBeInTheDocument();
  });

  const variants: {
    variant: InlineBannerProps['variant'];
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
        renderInlineBanner({ children: 'banner content', variant });
        expect(screen.getByText('banner content')).toHaveStyle({
          backgroundColor: themes.light.backgroundColor[styles.backgroundColor],
          borderColor: themes.light.borderColor[styles.borderColor],
        });
      });
    },
  );
});
