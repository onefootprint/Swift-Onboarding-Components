import React from 'react';
import { customRender, screen } from 'test-utils';

import Field, { FieldProps } from './field';

describe('<Field />', () => {
  const renderBadge = ({ label = 'Name', value }: Partial<FieldProps>) =>
    customRender(<Field label={label} value={value} />);

  it('should render the label', () => {
    renderBadge({ label: 'Name' });
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  describe('when it has value', () => {
    it('should render the value', () => {
      renderBadge({ value: 'John Doe' });
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('when the value is falsy', () => {
    it('should render a placeholder if is empty', () => {
      renderBadge({ value: '' });
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('should render a placeholder if is undefined', () => {
      renderBadge({ value: undefined });
      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });
});
