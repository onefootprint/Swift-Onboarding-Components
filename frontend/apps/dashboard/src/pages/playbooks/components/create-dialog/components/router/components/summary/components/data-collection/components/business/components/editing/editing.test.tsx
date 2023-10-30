import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import EditingWithContext from './editing.test.config';

const renderEditing = () => {
  customRender(<EditingWithContext />);
};

describe('<Editing />', () => {
  it('should show legal entity type toggle', async () => {
    renderEditing();
    expect(
      screen.getByRole('switch', {
        name: 'Request users to provide their business legal entity type',
      }),
    ).toBeInTheDocument();
  });

  it('should show website toggle', async () => {
    renderEditing();
    expect(
      screen.getByRole('switch', {
        name: 'Request users to provide their business website',
      }),
    ).toBeInTheDocument();
  });

  it('should show phone number toggle', async () => {
    renderEditing();
    expect(
      screen.getByRole('switch', {
        name: 'Request that users provide their business phone number',
      }),
    ).toBeInTheDocument();
  });
});
