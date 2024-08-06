import '../../config/initializers/i18next-test';

import { customRender, screen } from '@onefootprint/test-utils';

import type { BreadcrumbProps } from './breadcrumb';
import Breadcrumb from './breadcrumb';
import BreadcrumbItem from './breadcrumb-item';

describe('<Breadcrumb />', () => {
  const renderBreadcrumb = ({ 'aria-label': ariaLabel = 'breadcrumb', separator = '/' }: Partial<BreadcrumbProps>) =>
    customRender(
      <Breadcrumb aria-label={ariaLabel} separator={separator}>
        <BreadcrumbItem href="#">Lorem</BreadcrumbItem>
        <BreadcrumbItem>Ipsum</BreadcrumbItem>
      </Breadcrumb>,
    );

  it('should show the aria label', () => {
    renderBreadcrumb({ 'aria-label': 'lorem' });
    expect(screen.getByLabelText('lorem')).toBeInTheDocument();
  });

  it('should render the separator', () => {
    renderBreadcrumb({ separator: '*' });
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
