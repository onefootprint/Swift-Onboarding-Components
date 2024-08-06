import '../../../../../../config/initializers/i18next-test';

import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { InvestorProfileDI, InvestorProfileRiskTolerance } from '@onefootprint/types';

import ContinueButton from 'src/plugins/investor-profile/components/form-with-error-footer/components/continue-button';
import type { RiskToleranceFormProps } from './risk-tolerance-form';
import RiskToleranceForm from './risk-tolerance-form';

describe('<RiskToleranceForm />', () => {
  const renderForm = ({
    defaultValues,
    isLoading,
    onSubmit = () => undefined,
  }: Partial<RiskToleranceFormProps> & { isLoading?: boolean }) => {
    customRender(
      <RiskToleranceForm
        defaultValues={defaultValues}
        footer={<ContinueButton isLoading={isLoading} />}
        onSubmit={onSubmit}
      />,
    );
  };

  it('should trigger onSubmit when form is submitted', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });

    const aggressive = screen.getByRole('radio', {
      name: 'Aggressive',
    }) as HTMLInputElement;
    await userEvent.click(aggressive);
    await waitFor(() => {
      expect(aggressive.checked).toBe(true);
    });

    const button = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith({
      [InvestorProfileDI.riskTolerance]: InvestorProfileRiskTolerance.aggressive,
    });
  });

  describe('renders default values correctly', () => {
    it('when there are no defaults', async () => {
      renderForm({});

      const conservative = screen.getByRole('radio', {
        name: 'Conservative',
      }) as HTMLInputElement;
      expect(conservative.checked).toBe(true);

      const moderate = screen.getByRole('radio', {
        name: 'Moderate',
      }) as HTMLInputElement;
      expect(moderate.checked).toBe(false);

      const aggressive = screen.getByRole('radio', {
        name: 'Aggressive',
      }) as HTMLInputElement;
      expect(aggressive.checked).toBe(false);
    });

    it('when there are defaults', async () => {
      renderForm({
        defaultValues: {
          [InvestorProfileDI.riskTolerance]: InvestorProfileRiskTolerance.moderate,
        },
      });

      const conservative = screen.getByRole('radio', {
        name: 'Conservative',
      }) as HTMLInputElement;
      expect(conservative.checked).toBe(false);

      const moderate = screen.getByRole('radio', {
        name: 'Moderate',
      }) as HTMLInputElement;
      expect(moderate.checked).toBe(true);

      const aggressive = screen.getByRole('radio', {
        name: 'Aggressive',
      }) as HTMLInputElement;
      expect(aggressive.checked).toBe(false);
    });
  });

  it('renders loading state correctly', async () => {
    renderForm({ isLoading: true });
    const button = screen.getByLabelText('Loading...');
    expect(button).toBeInTheDocument();
  });
});
