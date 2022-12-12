import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import { useStore } from '../../hooks/use-session';
import Onboarding from './onboarding';

const originalState = useStore.getState();

describe('<Onboarding />', () => {
  const renderOnboarding = () => customRender(<Onboarding />);

  beforeEach(() => {
    useStore.setState({
      data: {
        auth: '1',
        user: {
          email: 'jane.doe@acme.com',
          firstName: 'Jane',
          lastName: 'Doe',
        },
        org: {
          isLive: false,
          name: 'Acme',
          sandboxRestricted: false,
        },
      },
    });
  });

  afterAll(() => {
    useStore.setState(originalState);
  });

  it('should render the logged user email', () => {
    renderOnboarding();

    const email = screen.getByText('jane.doe@acme.com');
    expect(email).toBeInTheDocument();
  });
});
