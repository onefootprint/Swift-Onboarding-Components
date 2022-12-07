import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import { useStore } from '../../hooks/use-session-user';
import Onboarding from './onboarding';

const originalState = useStore.getState();

describe('<Onboarding />', () => {
  const renderOnboarding = () => customRender(<Onboarding />);

  beforeEach(() => {
    useStore.setState({
      data: {
        auth: '1',
        email: 'john.doe@gmail.com',
        firstName: 'John',
        lastName: 'Doe',
        sandboxRestricted: false,
        tenantName: 'Footprint',
      },
    });
  });

  afterAll(() => {
    useStore.setState(originalState);
  });

  it('should render the logged user email', () => {
    renderOnboarding();

    const email = screen.getByText('john.doe@gmail.com');
    expect(email).toBeInTheDocument();
  });
});
