import '../../../../../../config/initializers/i18next-test';

import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { InvestorProfileDI, InvestorProfileFundingSources } from '@onefootprint/types';
import React from 'react';

import ContinueButton from 'src/plugins/investor-profile/components/form-with-error-footer/components/continue-button';
import type { FundingSourcesFormProps } from './funding-sources-form';
import FundingSourcesForm from './funding-sources-form';

describe('<FundingSourcesForm />', () => {
  const renderForm = ({
    defaultValues,
    isLoading,
    onSubmit = () => undefined,
  }: Partial<FundingSourcesFormProps> & { isLoading?: boolean }) => {
    customRender(
      <FundingSourcesForm
        defaultValues={defaultValues}
        footer={<ContinueButton isLoading={isLoading} />}
        onSubmit={onSubmit}
      />,
    );
  };

  describe('when it has default values', () => {
    it('renders default values correctly', async () => {
      const onSubmit = jest.fn();
      renderForm({
        onSubmit,
        defaultValues: {
          [InvestorProfileDI.fundingSources]: [InvestorProfileFundingSources.family],
        },
      });

      const employement = screen.getByLabelText('Employment income') as HTMLInputElement;
      expect(employement.checked).toBe(false);

      const investments = screen.getByLabelText('Investments') as HTMLInputElement;
      expect(investments.checked).toBe(false);

      const inheritance = screen.getByLabelText('Inheritance') as HTMLInputElement;
      expect(inheritance.checked).toBe(false);

      const businessIncome = screen.getByLabelText('Business income') as HTMLInputElement;
      expect(businessIncome.checked).toBe(false);

      const savings = screen.getByLabelText('Savings') as HTMLInputElement;
      expect(savings.checked).toBe(false);

      const family = screen.getByLabelText('Family') as HTMLInputElement;
      expect(family.checked).toBe(true);

      const button = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(button);

      expect(onSubmit).toHaveBeenCalledWith({
        [InvestorProfileDI.fundingSources]: [InvestorProfileFundingSources.family],
      });
    });
  });

  describe('when submitting an invalid form', () => {
    it('should show an error message', async () => {
      const onSubmit = jest.fn();
      renderForm({ onSubmit });

      const button = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(button);
      expect(onSubmit).not.toHaveBeenCalled();

      await waitFor(() => {
        const errorMessage = screen.getByText('Please select at least one funding source');
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });

  describe('when submitting a valid form', () => {
    it('should trigger onSubmit when form is submitted', async () => {
      const onSubmit = jest.fn();
      renderForm({ onSubmit });

      const employement = screen.getByLabelText('Employment income') as HTMLInputElement;
      await userEvent.click(employement);

      const inheritance = screen.getByLabelText('Inheritance') as HTMLInputElement;
      await userEvent.click(inheritance);

      const button = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(button);

      expect(onSubmit).toHaveBeenCalledWith({
        [InvestorProfileDI.fundingSources]: [
          InvestorProfileFundingSources.employmentIncome,
          InvestorProfileFundingSources.inheritance,
        ],
      });
    });
  });
});
