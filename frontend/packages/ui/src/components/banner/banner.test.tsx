import { screen } from '@testing-library/react';
import { customRender } from '../../utils/test-utils';

import type { BannerProps } from './banner';
import Badge from './banner';

describe('<Badge />', () => {
  const renderBanner = ({ children = 'banner content', variant = 'warning' }: Partial<BannerProps>) =>
    customRender(<Badge variant={variant}>{children}</Badge>);

  it('should render the text', () => {
    renderBanner({ children: 'banner content' });
    expect(screen.getByText('banner content')).toBeInTheDocument();
  });
});
