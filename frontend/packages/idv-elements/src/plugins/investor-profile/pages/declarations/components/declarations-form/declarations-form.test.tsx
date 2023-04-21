import {
  InvestorProfileDeclaration,
  InvestorProfileDI,
} from '@onefootprint/types';
import React from 'react';

import {
  renderInvestorProfile,
  screen,
  userEvent,
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

  it('onSubmit is called when form is submitted', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });

    const politicalFig = screen.getByLabelText(
      "I'm a senior political figure",
    ) as HTMLInputElement;
    expect(politicalFig.checked).toBe(false);
    await userEvent.click(politicalFig);
    expect(politicalFig.checked).toBe(true);

    const politicalFam = screen.getByLabelText(
      "I'm a family member or relative of a senior political figure",
    ) as HTMLInputElement;
    expect(politicalFam.checked).toBe(false);
    await userEvent.click(politicalFam);
    expect(politicalFam.checked).toBe(true);

    const button = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith({
      [InvestorProfileDI.declarations]: [
        InvestorProfileDeclaration.seniorPoliticalFigure,
        InvestorProfileDeclaration.familyOfPoliticalFigure,
      ],
    });
  });

  it('renders default values correctly', async () => {
    renderForm({
      defaultValues: {
        [InvestorProfileDI.declarations]: [
          InvestorProfileDeclaration.familyOfPoliticalFigure,
        ],
      },
    });

    const affiliation = screen.getByLabelText(
      'Affiliated or work with the US registered broker-dealer or FINRA',
    ) as HTMLInputElement;
    expect(affiliation.checked).toBe(false);

    const seniorExec = screen.getByLabelText(
      'Senior executive at or a 10% or greater shareholder of a publicly traded company',
    ) as HTMLInputElement;
    expect(seniorExec.checked).toBe(false);

    const politicalFig = screen.getByLabelText(
      "I'm a senior political figure",
    ) as HTMLInputElement;
    expect(politicalFig.checked).toBe(false);

    const politicalFam = screen.getByLabelText(
      "I'm a family member or relative of a senior political figure",
    ) as HTMLInputElement;
    expect(politicalFam.checked).toBe(true);
  });

  it('renders loading state correctly', async () => {
    renderForm({ isLoading: true });
    const button = screen.getByLabelText('Loading...');
    expect(button).toBeInTheDocument();
  });
});
