import { customRender, screen } from '@onefootprint/test-utils';
import React from 'react';

import Fieldset, { FieldsetProps } from './fieldset';

describe('<Fieldset />', () => {
  const renderFieldset = ({
    label = 'Label',
    editLabel = 'Edit',
    addLabel = 'Add',
    value,
  }: Partial<FieldsetProps>) =>
    customRender(
      <Fieldset
        addLabel={addLabel}
        editLabel={editLabel}
        label={label}
        value={value}
      />,
    );

  it('should render the label', () => {
    renderFieldset({ label: 'Company name' });

    expect(screen.getByText('Company name')).toBeInTheDocument();
  });

  it('should render the value', () => {
    renderFieldset({ label: 'Footprint' });

    expect(screen.getByText('Footprint')).toBeInTheDocument();
  });

  describe('when value is not present', () => {
    it('should render the add label', () => {
      renderFieldset({ addLabel: 'Add company name', value: null });
      expect(
        screen.getByRole('button', { name: 'Add company name' }),
      ).toBeInTheDocument();
    });
  });

  describe('when value is present', () => {
    it('should render the edit label', () => {
      renderFieldset({ editLabel: 'Edit company name', value: 'Footprint' });
      expect(
        screen.getByRole('button', { name: 'Edit company name' }),
      ).toBeInTheDocument();
    });
  });
});
