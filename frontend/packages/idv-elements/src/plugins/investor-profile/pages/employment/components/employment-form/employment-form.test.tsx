import { InvestorProfileDI } from '@onefootprint/types';
import React from 'react';

import {
  renderInvestorProfile,
  screen,
  selectEvents,
  userEvent,
  waitFor,
} from '@/investor-profile/config/tests';

import EmploymentForm, { EmploymentFormProps } from './employment-form';

describe('<EmploymentForm />', () => {
  const renderForm = ({
    defaultValues,
    isLoading,
    onSubmit = () => {},
  }: Partial<EmploymentFormProps>) => {
    renderInvestorProfile(
      <EmploymentForm
        defaultValues={defaultValues}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />,
    );
  };

  describe('when selecting an employed status', () => {
    it('should trigger onSubmit with occupation and employer', async () => {
      const onSubmit = jest.fn();
      renderForm({ onSubmit });

      const occupation = screen.getByLabelText('Occupation');
      await userEvent.type(occupation, 'Doctor');

      const employeer = screen.getByLabelText('Employer');
      await userEvent.type(employeer, 'Acme');

      const button = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(button);

      expect(onSubmit).toHaveBeenCalledWith({
        [InvestorProfileDI.status]: 'employed',
        [InvestorProfileDI.occupation]: 'Doctor',
        [InvestorProfileDI.employer]: 'Acme',
      });
    });
  });

  describe('when selecting an unemployed status', () => {
    it('should trigger onSubmit with occupation and employer empty', async () => {
      const onSubmit = jest.fn();
      renderForm({ onSubmit });

      const trigger = screen.getByRole('button', { name: 'Employed' });
      await selectEvents.select(trigger, 'Unemployed');

      const button = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(button);

      expect(onSubmit).toHaveBeenCalledWith({
        [InvestorProfileDI.status]: 'unemployed',
        [InvestorProfileDI.occupation]: '',
        [InvestorProfileDI.employer]: '',
      });
    });
  });

  describe('when selecting a retired status', () => {
    it('should trigger onSubmit with occupation and employer empty', async () => {
      const onSubmit = jest.fn();
      renderForm({ onSubmit });

      const trigger = screen.getByRole('button', { name: 'Employed' });
      await selectEvents.select(trigger, 'Retired');

      const button = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(button);

      expect(onSubmit).toHaveBeenCalledWith({
        [InvestorProfileDI.status]: 'retired',
        [InvestorProfileDI.occupation]: '',
        [InvestorProfileDI.employer]: '',
      });
    });
  });

  describe('when selecting a student status', () => {
    it('should trigger onSubmit with occupation and employer empty', async () => {
      const onSubmit = jest.fn();
      renderForm({ onSubmit });

      const trigger = screen.getByRole('button', { name: 'Employed' });
      await selectEvents.select(trigger, 'Student');

      const button = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(button);

      expect(onSubmit).toHaveBeenCalledWith({
        [InvestorProfileDI.status]: 'student',
        [InvestorProfileDI.occupation]: '',
        [InvestorProfileDI.employer]: '',
      });
    });
  });

  describe('default values correctly', () => {
    it('should render the occupation and employer when is employed', async () => {
      renderForm({
        defaultValues: {
          [InvestorProfileDI.status]: 'employed',
          [InvestorProfileDI.occupation]: 'Doctor',
          [InvestorProfileDI.employer]: 'Acme',
        },
      });

      const status = screen.getByText('Employed');
      expect(status).toBeInTheDocument();

      const occupation = screen.getByLabelText('Occupation');
      expect(occupation).toHaveValue('Doctor');

      const employer = screen.getByLabelText('Employer');
      expect(employer).toHaveValue('Acme');
    });

    it('should default to employed when is empty', async () => {
      renderForm({
        defaultValues: {},
      });

      const status = screen.getByText('Employed');
      expect(status).toBeInTheDocument();
    });
  });

  it('renders loading state correctly', async () => {
    renderForm({ isLoading: true });
    const button = screen.getByLabelText('Loading...');
    expect(button).toBeInTheDocument();
  });

  it('renders error state correctly', async () => {
    renderForm({
      defaultValues: {
        [InvestorProfileDI.occupation]: 'test',
      },
    });

    const occupation = screen.getByLabelText('Occupation');
    await userEvent.clear(occupation);

    const button = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText('Occupation is required')).toBeInTheDocument();
    });
  });
});
