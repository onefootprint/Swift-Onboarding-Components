import {
  customRender,
  screen,
  selectEvents,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import CompanyData, { CompanyDataProps } from './company-data';

describe('<CompanyData />', () => {
  const renderCompanyData = ({
    id = 'company-form',
    onComplete = jest.fn(),
  }: Partial<CompanyDataProps>) => {
    customRender(
      <>
        <div id="onboarding-cta-portal" />
        <CompanyData id={id} onComplete={onComplete} />
      </>,
    );
  };

  describe('when submitting the form', () => {
    it('should show an error when the first input is not filled correctly', async () => {
      renderCompanyData({});
      const submitButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(submitButton);
      const error = await screen.findByText('Please enter a name');
      expect(error).toBeInTheDocument();
    });

    it('should call onComplete when the form is valid', async () => {
      const onComplete = jest.fn();
      renderCompanyData({ onComplete });
      const nameField = screen.getByLabelText('Company name');
      await userEvent.type(nameField, 'Acme');
      const sizeField = screen.getByRole('button', { name: 'Select' });
      await selectEvents.select(sizeField, '1-10');
      const submitButton = screen.getByRole('button', { name: 'Next' });
      await userEvent.click(submitButton);
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });
    });
  });
});
