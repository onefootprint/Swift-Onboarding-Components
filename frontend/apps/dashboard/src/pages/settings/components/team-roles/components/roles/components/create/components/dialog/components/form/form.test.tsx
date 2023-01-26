import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import Form, { FormProps } from './form';

describe('<Form />', () => {
  const renderForm = ({ onSubmit = jest.fn() }: Partial<FormProps>) =>
    customRender(<Form onSubmit={onSubmit} />);

  it('should render the read-only as checked by default', () => {
    renderForm({});

    const readonlyToggle = screen.getByRole('checkbox', { name: 'Read only' });
    expect(readonlyToggle).toBeChecked();
  });
});
