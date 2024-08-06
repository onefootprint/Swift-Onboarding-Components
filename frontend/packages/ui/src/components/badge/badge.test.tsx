import '../../config/initializers/i18next-test';

import type { UIState } from '@onefootprint/design-tokens';
import themes from '@onefootprint/design-tokens';
import { customRender, screen } from '@onefootprint/test-utils';

import type { BadgeProps } from './badge';
import Badge from './badge';

describe('<Badge />', () => {
  const renderBadge = ({ children = 'Foo', variant = 'info', testID }: Partial<BadgeProps>) =>
    customRender(
      <Badge variant={variant} testID={testID}>
        {children}
      </Badge>,
    );

  it('should assign a testID', () => {
    renderBadge({ testID: 'badge-test-id' });
    expect(screen.getByTestId('badge-test-id')).toBeInTheDocument();
  });

  it('should render the text', () => {
    renderBadge({ children: 'Badge content' });
    expect(screen.getByText('Badge content')).toBeInTheDocument();
  });

  const variants: { variant: UIState }[] = [
    { variant: 'success' },
    { variant: 'error' },
    { variant: 'info' },
    { variant: 'warning' },
    { variant: 'neutral' },
  ];
  describe.each(variants)('when is set the variant $variant', ({ variant }) => {
    it('should render with the correct styles', () => {
      renderBadge({ children: 'Badge content', variant });
      expect(screen.getByText('Badge content')).toHaveStyle({
        backgroundColor: themes.light.backgroundColor[variant],
        color: themes.light.color[variant],
      });
    });
  });
});
