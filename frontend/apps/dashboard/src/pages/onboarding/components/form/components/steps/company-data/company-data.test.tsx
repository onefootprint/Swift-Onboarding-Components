import { customRender, screen, selectEvents, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import type { CompanyDataProps } from './company-data';
import CompanyData from './company-data';
import { orgFixture, withOrg, withOrgError, withUpdateOrg, withUpdateOrgError } from './company-data.test.config';

describe('<CompanyData />', () => {
  const renderCompanyData = ({ onBack = jest.fn(), onComplete = jest.fn() }: Partial<CompanyDataProps>) => {
    customRender(<CompanyData onComplete={onComplete} onBack={onBack} />);
  };

  const renderCompanyDataAndWaitData = async ({
    onBack = jest.fn(),
    onComplete = jest.fn(),
  }: Partial<CompanyDataProps>) => {
    renderCompanyData({ onComplete, onBack });
    await waitFor(() => {
      screen.getByTestId('onboarding-company-data-content');
      screen.getByRole('button', { name: 'Next' });
    });
  };

  describe('when the request to fetch the org is loading', () => {
    beforeEach(() => {
      withOrg();
    });

    it('should show a loading state', () => {
      renderCompanyData({});

      const loading = screen.getByTestId('onboarding-company-data-loading');
      expect(loading).toBeInTheDocument();
    });
  });

  describe('when the request to fetch the org fails', () => {
    beforeEach(() => {
      withOrgError();
    });

    it('should show an error message', async () => {
      renderCompanyData({});

      const error = await screen.findByText('Something went wrong');
      expect(error).toBeInTheDocument();
    });
  });

  describe('when the request to fetch the org succeeds', () => {
    beforeEach(() => {
      withOrg();
    });

    it('should show the form with the name pre-filled', async () => {
      await renderCompanyDataAndWaitData({});

      const nameField = screen.getByLabelText('Company name');
      expect(nameField).toHaveValue(orgFixture.name);
    });

    describe('when submitting the form', () => {
      describe('when the company name is empty', () => {
        it('should an error message', async () => {
          await renderCompanyDataAndWaitData({});

          const nameField = screen.getByLabelText('Company name');
          await userEvent.clear(nameField);

          const submitButton = screen.getByRole('button', { name: 'Next' });
          await userEvent.click(submitButton);

          const error = await screen.findByText('Please enter a name');
          expect(error).toBeInTheDocument();
        });
      });

      describe('when the website url is empty', () => {
        it('should an error message', async () => {
          await renderCompanyDataAndWaitData({});

          const submitButton = screen.getByRole('button', { name: 'Next' });
          await userEvent.click(submitButton);

          const error = await screen.findByText('Please enter a website');
          expect(error).toBeInTheDocument();
        });
      });

      describe('when the request to update the org fails', () => {
        beforeEach(() => {
          withUpdateOrgError();
        });

        it('should show an error message', async () => {
          await renderCompanyDataAndWaitData({});

          const nameField = screen.getByLabelText('Company name');
          await userEvent.clear(nameField);
          await userEvent.type(nameField, 'Acme Corp');

          const websiteField = screen.getByLabelText('Company website');
          await userEvent.type(websiteField, 'https://acme.com');

          const sizeField = screen.getByRole('button', { name: 'Select' });
          await selectEvents.select(sizeField, '1-10');

          const submitButton = screen.getByRole('button', { name: 'Next' });
          await userEvent.click(submitButton);

          const error = await screen.findByText('Something went wrong');
          expect(error).toBeInTheDocument();
        });
      });

      describe('when the request to update the org succeeds', () => {
        beforeEach(() => {
          withUpdateOrg({
            ...orgFixture,
            name: 'Acme Corp',
            websiteUrl: 'https://acme.com',
          });
        });

        it('should update the org and trigger onComplete', async () => {
          const onComplete = jest.fn();
          await renderCompanyDataAndWaitData({ onComplete });

          const nameField = screen.getByLabelText('Company name');
          await userEvent.clear(nameField);
          await userEvent.type(nameField, 'Acme Corp');

          const websiteField = screen.getByLabelText('Company website');
          await userEvent.type(websiteField, 'https://acme.com');

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

    describe('when clicking on the back button', () => {
      it('should call onBack', async () => {
        const onBack = jest.fn();
        await renderCompanyDataAndWaitData({ onBack });

        const backButton = screen.getByRole('button', { name: 'Back' });
        await userEvent.click(backButton);

        expect(onBack).toHaveBeenCalled();
      });
    });
  });
});
