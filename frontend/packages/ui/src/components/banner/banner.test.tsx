import React from 'react';
import { customRender, screen } from 'test-utils';
import themes from 'themes';

import Badge, { BannerProps } from './banner';

describe('<Badge />', () => {
  const renderBanner = ({
    children = 'banner content',
    variant = 'warning',
  }: Partial<BannerProps>) =>
    customRender(<Badge variant={variant}>{children}</Badge>);

  it('should assign a role alert', () => {
    renderBanner({ children: 'banner content' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render the text', () => {
    renderBanner({ children: 'banner content' });
    expect(screen.getByText('banner content')).toBeInTheDocument();
  });

  const variants: { variant: BannerProps['variant'] }[] = [
    { variant: 'error' },
    { variant: 'info' },
    { variant: 'warning' },
  ];
  describe.each(variants)('when is the variant $variant', ({ variant }) => {
    it('should render with the correct styles', () => {
      renderBanner({ children: 'banner content', variant });
      expect(screen.getByText('banner content')).toHaveStyle({
        backgroundColor: themes.light.backgroundColor[variant],
        color: themes.light.color[variant],
      });
    });
  });
});
