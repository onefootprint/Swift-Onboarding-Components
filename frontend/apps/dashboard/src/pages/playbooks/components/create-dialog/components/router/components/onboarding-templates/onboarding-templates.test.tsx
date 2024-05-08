import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';
import { OnboardingTemplate } from 'src/pages/playbooks/utils/machine/types';

import OnboardingTemplates from '.';
import type { OnboardingTemplatesProps } from './onboarding-templates';

const renderOnboardingTemplates = ({
  onSubmit,
  onBack,
}: OnboardingTemplatesProps) =>
  customRender(<OnboardingTemplates onSubmit={onSubmit} onBack={onBack} />);

describe('<OnboardingTemplates />', () => {
  it('should render correctly', () => {
    const onSubmit = jest.fn();
    const onBack = jest.fn();
    renderOnboardingTemplates({ onSubmit, onBack });
    expect(
      screen.getByText(
        'Configure your own KYC settings or select a pre-defined template.',
      ),
    ).toBeInTheDocument();
    const customPlaybookOption = screen.getByRole('button', {
      name: 'Custom',
    });
    expect(customPlaybookOption).toBeInTheDocument();
    const alpacaOption = screen.getByRole('button', {
      name: 'Alpaca',
    });
    expect(alpacaOption).toBeInTheDocument();
    const apexOption = screen.getByRole('button', {
      name: 'Apex',
    });
    expect(apexOption).toBeInTheDocument();
  });

  it('when Alpaca is selected, onSubmit is called with alpaca', async () => {
    const onSubmit = jest.fn();
    const onBack = jest.fn();
    renderOnboardingTemplates({ onSubmit, onBack });
    const alpacaOption = screen.getByRole('button', { name: 'Alpaca' });
    await userEvent.click(alpacaOption);
    const nextButton = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(nextButton);
    expect(onSubmit).toHaveBeenCalledWith({
      template: OnboardingTemplate.Alpaca,
    });
  });

  it('when Custom is selected, onSubmit is called with custom', async () => {
    const onSubmit = jest.fn();
    const onBack = jest.fn();
    renderOnboardingTemplates({ onSubmit, onBack });
    const customOption = screen.getByRole('button', { name: 'Custom' });
    await userEvent.click(customOption);
    const nextButton = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(nextButton);
    expect(onSubmit).toHaveBeenCalledWith({
      template: OnboardingTemplate.Custom,
    });
  });

  it('when Apex is selected, onSubmit is called with apex', async () => {
    const onSubmit = jest.fn();
    const onBack = jest.fn();
    renderOnboardingTemplates({ onSubmit, onBack });
    const apexOption = screen.getByRole('button', { name: 'Apex' });
    await userEvent.click(apexOption);
    const nextButton = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(nextButton);
    expect(onSubmit).toHaveBeenCalledWith({ template: 'apex' });
  });

  it("when car-rental is selected, onSubmit is called with 'car-rental'", async () => {
    const onSubmit = jest.fn();
    const onBack = jest.fn();
    renderOnboardingTemplates({ onSubmit, onBack });
    const carRentalOption = screen.getByRole('button', {
      name: 'Car rental',
    });
    await userEvent.click(carRentalOption);
    const nextButton = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(nextButton);
    expect(onSubmit).toHaveBeenCalledWith({
      template: OnboardingTemplate.CarRental,
    });
  });

  it("when credit-card is selected, onSubmit is called with 'credit-card'", async () => {
    const onSubmit = jest.fn();
    const onBack = jest.fn();
    renderOnboardingTemplates({ onSubmit, onBack });
    const creditCardOption = screen.getByRole('button', {
      name: 'Credit card',
    });
    await userEvent.click(creditCardOption);
    const nextButton = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(nextButton);
    expect(onSubmit).toHaveBeenCalledWith({
      template: OnboardingTemplate.CreditCard,
    });
  });

  it('when tenant-screening is selected, onSubmit is called with tenant-screening', async () => {
    const onSubmit = jest.fn();
    const onBack = jest.fn();
    renderOnboardingTemplates({ onSubmit, onBack });
    const tenantScreeningOption = screen.getByRole('button', {
      name: 'Tenant screening',
    });
    await userEvent.click(tenantScreeningOption);
    const nextButton = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(nextButton);
    expect(onSubmit).toHaveBeenCalledWith({
      template: OnboardingTemplate.TenantScreening,
    });
  });

  it('when back is pressed, back is called correctly', async () => {
    const onSubmit = jest.fn();
    const onBack = jest.fn();
    renderOnboardingTemplates({ onSubmit, onBack });
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalled();
  });
});
