import '../../../../../../config/initializers/i18next-test';

import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { InvestorProfileDI, InvestorProfileDeclaration } from '@onefootprint/types';
import React from 'react';

import type { DeclarationsFormProps } from './declarations-form';
import DeclarationsForm from './declarations-form';

describe('<DeclarationsForm />', () => {
  const renderForm = ({ defaultValues, isLoading, onSubmit = () => undefined }: Partial<DeclarationsFormProps>) => {
    customRender(<DeclarationsForm defaultValues={defaultValues} isLoading={isLoading} onSubmit={onSubmit} />);
  };

  describe('when the user is affiliated or work with a broke dealer', () => {
    it('should trigger onSubmit with company symbols and the file uploaded', async () => {
      const onSubmit = jest.fn();
      renderForm({ onSubmit });

      const broker = screen.getByLabelText('Affiliated or work with a US registered broker-dealer or FINRA');
      await userEvent.click(broker);

      await waitFor(() => {
        expect(screen.getByLabelText('Firm name')).toBeInTheDocument();
      });
      const firmName = screen.getByLabelText('Firm name');
      await userEvent.type(firmName, 'Lorem Dolor');

      const button = screen.getByRole('button', {
        name: 'Choose file to upload',
      });
      await userEvent.click(button);

      const fileInput = screen.getByTestId('file-upload-input') as HTMLInputElement;
      const file = new File(['hello'], 'example.pdf', {
        type: 'application/pdf',
      });
      await userEvent.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          {
            [InvestorProfileDI.declarations]: [InvestorProfileDeclaration.affiliatedWithUsBroker],
            [InvestorProfileDI.brokerageFirmEmployer]: 'Lorem Dolor',
          },
          expect.anything(),
        );
      });
    });
  });

  describe('when the user is a senior executive', () => {
    it('should trigger onSubmit with company symbols and the file uploaded', async () => {
      const onSubmit = jest.fn();
      renderForm({ onSubmit });

      const seniorExecutive = screen.getByLabelText(
        'Senior executive at or a 10% or greater shareholder of a publicly traded company',
      );
      await userEvent.click(seniorExecutive);

      await waitFor(() => {
        expect(screen.getByLabelText('Company symbols')).toBeInTheDocument();
      });
      const companySymbols = screen.getByLabelText('Company symbols');
      await userEvent.type(companySymbols, 'AAPL,GOOG');

      const button = screen.getByRole('button', {
        name: 'Choose file to upload',
      });
      await userEvent.click(button);

      const fileInput = screen.getByTestId('file-upload-input') as HTMLInputElement;
      const file = new File(['hello'], 'example.pdf', {
        type: 'application/pdf',
      });
      await userEvent.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          {
            [InvestorProfileDI.declarations]: [InvestorProfileDeclaration.seniorExecutive],
            [InvestorProfileDI.seniorExecutiveSymbols]: ['AAPL', 'GOOG'],
          },
          expect.anything(),
        );
      });
    });
  });

  describe('when the user is a a political', () => {
    it('should trigger onSubmit with family members and political organization', async () => {
      const onSubmit = jest.fn();
      renderForm({ onSubmit });

      const seniorPoliticalFigure = screen.getByLabelText("I'm a senior political figure");
      await userEvent.click(seniorPoliticalFigure);

      await waitFor(() => {
        expect(screen.getByLabelText('Names of immediate family members')).toBeInTheDocument();
      });
      const familyMembers = screen.getByLabelText('Names of immediate family members');
      await userEvent.type(familyMembers, 'Jane Doe, John Doe');

      const politicalOrganization = screen.getByLabelText('Political organization');
      await userEvent.type(politicalOrganization, 'The White House');

      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          [InvestorProfileDI.declarations]: ['senior_political_figure'],
          [InvestorProfileDI.familyMemberNames]: ['Jane Doe', 'John Doe'],
          [InvestorProfileDI.politicalOrganization]: 'The White House',
          [InvestorProfileDI.seniorExecutiveSymbols]: undefined,
        });
      });
    });
  });

  describe('when it has defaultValues', () => {
    it('renders default values correctly', async () => {
      renderForm({
        defaultValues: {
          [InvestorProfileDI.declarations]: [
            InvestorProfileDeclaration.seniorExecutive,
            InvestorProfileDeclaration.seniorPoliticalFigure,
          ],
          [InvestorProfileDI.seniorExecutiveSymbols]: ['AAPL', 'GOOG'],
          [InvestorProfileDI.familyMemberNames]: ['Jane Doe'],
        },
      });

      const affiliation = screen.getByLabelText(
        'Affiliated or work with a US registered broker-dealer or FINRA',
      ) as HTMLInputElement;
      expect(affiliation.checked).toBe(false);

      const seniorExec = screen.getByLabelText(
        'Senior executive at or a 10% or greater shareholder of a publicly traded company',
      ) as HTMLInputElement;
      expect(seniorExec.checked).toBe(true);

      const seniorPoliticalFigure = screen.getByLabelText("I'm a senior political figure") as HTMLInputElement;
      expect(seniorPoliticalFigure.checked).toBe(true);

      const companySymbols = screen.getByLabelText('Company symbols');
      expect(companySymbols).toHaveValue('AAPL,GOOG');

      const familyMembers = screen.getByLabelText('Names of immediate family members');
      expect(familyMembers).toHaveValue('Jane Doe');
    });
  });

  describe('when is loading', () => {
    it('should render the loading state correctly', async () => {
      renderForm({ isLoading: true });
      const button = screen.getByLabelText('Loading...');
      expect(button).toBeInTheDocument();
    });
  });
});
