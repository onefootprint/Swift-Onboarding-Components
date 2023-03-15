import {
  createUseRouterSpy,
  customRender,
  screen,
} from '@onefootprint/test-utils';
import React from 'react';

import Details from './details';

const useRouterSpy = createUseRouterSpy();

describe('<Details />', () => {
  beforeEach(() => {
    useRouterSpy({ pathname: '/developers', query: {} });
  });

  const renderDetails = () => {
    customRender(<Details />);
  };

  it('should show a breadcrumb, with an option to return to the list pages', () => {
    renderDetails();

    const breadcrumb = screen.getByLabelText('Business details breadcrumb');
    expect(breadcrumb).toBeInTheDocument();

    const listLink = screen.getByRole('link', { name: 'Businesses' });
    expect(listLink).toBeInTheDocument();
    expect(listLink.getAttribute('href')).toEqual('/businesses');
  });
});
