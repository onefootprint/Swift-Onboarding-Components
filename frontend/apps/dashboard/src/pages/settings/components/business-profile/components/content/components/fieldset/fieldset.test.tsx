import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';
import { asAdminUser, resetUser } from 'src/config/tests';

import type { FieldsetProps } from './fieldset';
import Fieldset from './fieldset';

describe('<Fieldset />', () => {
  beforeEach(() => {
    asAdminUser();
  });

  afterAll(() => {
    resetUser();
  });

  const renderFieldset = ({ label = 'Label', value, children = () => <div>children</div> }: Partial<FieldsetProps>) =>
    customRender(
      <Fieldset label={label} value={value}>
        {children}
      </Fieldset>,
    );

  it('should render the label', () => {
    renderFieldset({ label: 'Company name' });

    expect(screen.getByText('Company name')).toBeInTheDocument();
  });

  it('should render the value', () => {
    renderFieldset({ value: 'Footprint' });

    expect(screen.getByText('Footprint')).toBeInTheDocument();
  });

  describe('when value is not present', () => {
    it('should render the add label', () => {
      renderFieldset({ label: 'Company name', value: null });

      expect(screen.getByRole('button', { name: 'Add company name' })).toBeInTheDocument();
    });

    describe('when clicking on the add label', () => {
      it('should open the dialog', async () => {
        renderFieldset({ label: 'Company name', value: null });

        await userEvent.click(
          screen.getByRole('button', {
            name: 'Add company name',
          }),
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('when value is present', () => {
    it('should render the edit label', () => {
      renderFieldset({ label: 'Company name', value: 'Footprint' });

      expect(screen.getByRole('button', { name: 'Edit company name' })).toBeInTheDocument();
    });

    describe('when clicking on the edit label', () => {
      it('should open the dialog', async () => {
        renderFieldset({ label: 'Company name', value: 'Footprint' });

        await userEvent.click(
          screen.getByRole('button', {
            name: 'Edit company name',
          }),
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });
});
