import {
  InvestorProfileDataAttribute,
  InvestorProfileNetWorth,
} from '@onefootprint/types';
import React from 'react';

import {
  renderInvestorProfile,
  screen,
  userEvent,
  waitFor,
} from '@/investor-profile/config/tests';

import NetWorthForm, { NetWorthFormProps } from './net-worth-form';

describe('<NetWorthForm />', () => {
  const renderForm = ({
    defaultValues,
    isLoading,
    onSubmit = () => {},
  }: Partial<NetWorthFormProps>) => {
    renderInvestorProfile(
      <NetWorthForm
        defaultValues={defaultValues}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />,
    );
  };

  it('onSubmit is called when form is submitted', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });

    const s50kTo100k = screen.getByRole('radio', {
      name: '$50,000 - $100,000',
    }) as HTMLInputElement;
    await userEvent.click(s50kTo100k);
    await waitFor(() => {
      expect(s50kTo100k.checked).toBe(true);
    });

    const button = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith({
      [InvestorProfileDataAttribute.netWorth]:
        InvestorProfileNetWorth.s50kTo100k,
    });
  });

  describe('renders default values correctly', () => {
    it('when there are no defaults', async () => {
      renderForm({});

      const lt50k = screen.getByRole('radio', {
        name: 'Under $50,000',
      }) as HTMLInputElement;
      expect(lt50k.checked).toBe(true);

      const s50kTo100k = screen.getByRole('radio', {
        name: '$50,000 - $100,000',
      }) as HTMLInputElement;
      expect(s50kTo100k.checked).toBe(false);

      const s100kTo250k = screen.getByRole('radio', {
        name: '$100,000 - $250,000',
      }) as HTMLInputElement;
      expect(s100kTo250k.checked).toBe(false);

      const s250kTo500k = screen.getByRole('radio', {
        name: '$250,000 - $500,000',
      }) as HTMLInputElement;
      expect(s250kTo500k.checked).toBe(false);

      const S500kTo1m = screen.getByRole('radio', {
        name: '$500,000 - $1,000,000',
      }) as HTMLInputElement;
      expect(S500kTo1m.checked).toBe(false);

      const gt1m = screen.getByRole('radio', {
        name: '$1,000,000+',
      }) as HTMLInputElement;
      expect(gt1m.checked).toBe(false);
    });

    it('when there is a default value prop', async () => {
      renderForm({
        defaultValues: {
          [InvestorProfileDataAttribute.netWorth]:
            InvestorProfileNetWorth.s250kTo500k,
        },
      });

      const lt50k = screen.getByRole('radio', {
        name: 'Under $50,000',
      }) as HTMLInputElement;
      expect(lt50k.checked).toBe(false);

      const s50kTo100k = screen.getByRole('radio', {
        name: '$50,000 - $100,000',
      }) as HTMLInputElement;
      expect(s50kTo100k.checked).toBe(false);

      const s100kTo250k = screen.getByRole('radio', {
        name: '$100,000 - $250,000',
      }) as HTMLInputElement;
      expect(s100kTo250k.checked).toBe(false);

      const s250kTo500k = screen.getByRole('radio', {
        name: '$250,000 - $500,000',
      }) as HTMLInputElement;
      expect(s250kTo500k.checked).toBe(true);

      const S500kTo1m = screen.getByRole('radio', {
        name: '$500,000 - $1,000,000',
      }) as HTMLInputElement;
      expect(S500kTo1m.checked).toBe(false);

      const gt1m = screen.getByRole('radio', {
        name: '$1,000,000+',
      }) as HTMLInputElement;
      expect(gt1m.checked).toBe(false);
    });
  });

  it('renders loading state correctly', async () => {
    renderForm({ isLoading: true });
    const button = screen.getByLabelText('Loading...');
    expect(button).toBeInTheDocument();
  });
});
