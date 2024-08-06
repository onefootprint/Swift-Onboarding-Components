import '../../../../../../config/initializers/i18next-test';

import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { InvestorProfileDI, InvestorProfileInvestmentGoal } from '@onefootprint/types';

import ContinueButton from 'src/plugins/investor-profile/components/form-with-error-footer/components/continue-button';
import type { InvestmentGoalsFormProps } from './investment-goals-form';
import InvestmentGoalsForm from './investment-goals-form';

describe('<InvestmentGoalsForm />', () => {
  const renderForm = ({
    defaultValues,
    isLoading,
    onSubmit = () => undefined,
  }: Partial<InvestmentGoalsFormProps> & { isLoading?: boolean }) => {
    customRender(
      <InvestmentGoalsForm
        defaultValues={defaultValues}
        footer={<ContinueButton isLoading={isLoading} />}
        onSubmit={onSubmit}
      />,
    );
  };

  it('should trigger onSubmit when form is submitted', async () => {
    const onSubmit = jest.fn();
    renderForm({
      onSubmit,
    });

    const growth = screen.getByLabelText('Growth') as HTMLInputElement;
    expect(growth.checked).toBe(false);
    await userEvent.click(growth);
    expect(growth.checked).toBe(true);

    const income = screen.getByLabelText('Income') as HTMLInputElement;
    expect(income.checked).toBe(false);

    const preserveCapital = screen.getByLabelText('Preserve capital') as HTMLInputElement;
    expect(preserveCapital.checked).toBe(false);
    await userEvent.click(preserveCapital);
    expect(preserveCapital.checked).toBe(true);

    const speculation = screen.getByLabelText('Speculation') as HTMLInputElement;
    expect(speculation.checked).toBe(false);

    const diversification = screen.getByLabelText('Diversification') as HTMLInputElement;
    expect(diversification.checked).toBe(false);

    const other = screen.getByLabelText('Other') as HTMLInputElement;
    expect(other.checked).toBe(false);

    const button = screen.getByRole('button', {
      name: 'Continue',
    }) as HTMLButtonElement;
    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith({
      [InvestorProfileDI.investmentGoals]: [
        InvestorProfileInvestmentGoal.growth,
        InvestorProfileInvestmentGoal.preserveCapital,
      ],
    });
  });

  it('renders default values correctly', async () => {
    const onSubmit = jest.fn();
    renderForm({
      onSubmit,
      defaultValues: {
        [InvestorProfileDI.investmentGoals]: [
          InvestorProfileInvestmentGoal.preserveCapital,
          InvestorProfileInvestmentGoal.speculation,
        ],
      },
    });

    const growth = screen.getByLabelText('Growth') as HTMLInputElement;
    expect(growth.checked).toBe(false);

    const income = screen.getByLabelText('Income') as HTMLInputElement;
    expect(income.checked).toBe(false);

    const preserveCapital = screen.getByLabelText('Preserve capital') as HTMLInputElement;
    expect(preserveCapital.checked).toBe(true);

    const speculation = screen.getByLabelText('Speculation') as HTMLInputElement;
    expect(speculation.checked).toBe(true);

    const diversification = screen.getByLabelText('Diversification') as HTMLInputElement;
    expect(diversification.checked).toBe(false);

    const other = screen.getByLabelText('Other') as HTMLInputElement;
    expect(other.checked).toBe(false);

    const button = screen.getByRole('button', {
      name: 'Continue',
    }) as HTMLButtonElement;
    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith({
      [InvestorProfileDI.investmentGoals]: [
        InvestorProfileInvestmentGoal.preserveCapital,
        InvestorProfileInvestmentGoal.speculation,
      ],
    });
  });

  it('renders loading state correctly', async () => {
    renderForm({ isLoading: true });
    const button = screen.getByLabelText('Loading...');
    expect(button).toBeInTheDocument();
  });

  it('renders error state correctly', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });
    const button = screen.getByRole('button', {
      name: 'Continue',
    }) as HTMLButtonElement;
    await userEvent.click(button);
    expect(onSubmit).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Please select at least one goal')).toBeInTheDocument();
    });
  });
});
