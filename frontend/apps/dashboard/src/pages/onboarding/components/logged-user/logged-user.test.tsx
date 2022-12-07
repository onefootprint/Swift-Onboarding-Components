import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import LoggedUser from './logged-user';

describe('<LoggedUser />', () => {
  it('should render the email of the logged user', () => {
    customRender(<LoggedUser email="john.doe@gmail.com" />);
    expect(screen.getByText('john.doe@gmail.com')).toBeInTheDocument();
  });
});
