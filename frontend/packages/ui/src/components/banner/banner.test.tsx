import '../../config/initializers/i18next-test';

import type { BackgroundColor, Color } from '@onefootprint/design-tokens';
import themes from '@onefootprint/design-tokens';
import { customRender, screen } from '@onefootprint/test-utils';

import type { BannerProps } from './banner';
import Badge from './banner';

describe('<Badge />', () => {
  const renderBanner = ({ children = 'banner content', variant = 'warning' }: Partial<BannerProps>) =>
    customRender(<Badge variant={variant}>{children}</Badge>);

  it('should assign a role alert', () => {
    renderBanner({ children: 'banner content' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render the text', () => {
    renderBanner({ children: 'banner content' });
    expect(screen.getByText('banner content')).toBeInTheDocument();
  });

  const variants: {
    variant: BannerProps['variant'];
    styles: {
      backgroundColor: BackgroundColor;
      color: Color;
    };
  }[] = [
    { variant: 'error', styles: { backgroundColor: 'error', color: 'error' } },
    { variant: 'info', styles: { backgroundColor: 'info', color: 'info' } },
    {
      variant: 'warning',
      styles: { backgroundColor: 'warning', color: 'warning' },
    },
    {
      variant: 'announcement',
      styles: { backgroundColor: 'primary', color: 'primary' },
    },
  ];
  describe.each(variants)('when is the variant $variant', ({ variant, styles }) => {
    it('should render with the correct styles', () => {
      renderBanner({ children: 'banner content', variant });
      expect(screen.getByText('banner content')).toHaveStyle({
        backgroundColor: themes.light.backgroundColor[styles.backgroundColor],
        color: themes.light.color[styles.color],
      });
    });
  });
});
