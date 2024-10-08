import '../../config/initializers/i18next-test';

import { customRender, screen } from '@onefootprint/test-utils';

import type { BreadcrumbItemProps } from './breadcrumb-item';
import BreadcrumbItem from './breadcrumb-item';

describe('<BreadcrumbItem />', () => {
  const renderBreadcrumbItem = ({ children = 'lorem', href = '#' }: Partial<BreadcrumbItemProps>) =>
    customRender(<BreadcrumbItem href={href}>{children}</BreadcrumbItem>);

  it('should render the content', () => {
    renderBreadcrumbItem({ children: 'lorem' });
    expect(screen.getByText('lorem')).toBeInTheDocument();
  });

  it('should assign the href', () => {
    renderBreadcrumbItem({
      children: 'lorem',
      href: 'https://onefootprint.com/',
    });
    const link = screen.getByRole('link') as HTMLAnchorElement;
    expect(link.href).toBe('https://onefootprint.com/');
  });
});
