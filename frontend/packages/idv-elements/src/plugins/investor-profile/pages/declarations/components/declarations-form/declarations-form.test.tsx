import {
  InvestorProfileDeclaration,
  InvestorProfileDI,
} from '@onefootprint/types';
import React from 'react';

import {
  renderInvestorProfile,
  screen,
  userEvent,
  waitFor,
} from '@/investor-profile/config/tests';

import DeclarationsForm, { DeclarationsFormProps } from './declarations-form';

describe('<DeclarationsForm />', () => {
  const renderForm = ({
    defaultValues,
    isLoading,
    onSubmit = () => {},
  }: Partial<DeclarationsFormProps>) => {
    renderInvestorProfile(
      <DeclarationsForm
        defaultValues={defaultValues}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />,
    );
  };

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
      userEvent.click(button);

      const fileInput = screen.getByTestId(
        'file-upload-input',
      ) as HTMLInputElement;
      const file = new File(['hello'], 'example.pdf', {
        type: 'application/pdf',
      });
      await userEvent.upload(fileInput, file);

      const submitButton = screen.getByRole('button', { name: 'Continue' });
      userEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          {
            [InvestorProfileDI.declarations]: [
              InvestorProfileDeclaration.seniorExecutive,
            ],
            [InvestorProfileDI.seniorExecutiveSymbols]: ['AAPL', 'GOOG'],
          },
          expect.anything(),
        );
      });
    });
  });

  describe('when it has defaultValues', () => {
    it('renders default values correctly', async () => {
      renderForm({
        defaultValues: {
          [InvestorProfileDI.declarations]: [
            InvestorProfileDeclaration.familyOfPoliticalFigure,
            InvestorProfileDeclaration.seniorExecutive,
          ],
          [InvestorProfileDI.seniorExecutiveSymbols]: ['AAPL', 'GOOG'],
        },
      });

      const affiliation = screen.getByLabelText(
        'Affiliated or work with the US registered broker-dealer or FINRA',
      ) as HTMLInputElement;
      expect(affiliation.checked).toBe(false);

      const seniorExec = screen.getByLabelText(
        'Senior executive at or a 10% or greater shareholder of a publicly traded company',
      ) as HTMLInputElement;
      expect(seniorExec.checked).toBe(true);

      const companySymbols = screen.getByLabelText('Company symbols');
      expect(companySymbols).toHaveValue('AAPL,GOOG');

      const politicalFig = screen.getByLabelText(
        "I'm a senior political figure",
      ) as HTMLInputElement;
      expect(politicalFig.checked).toBe(false);

      const politicalFam = screen.getByLabelText(
        "I'm a family member or relative of a senior political figure",
      ) as HTMLInputElement;
      expect(politicalFam.checked).toBe(true);
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
