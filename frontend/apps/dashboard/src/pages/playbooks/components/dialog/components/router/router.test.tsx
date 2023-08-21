import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import Router from './router';

const renderRouter = ({ onClose }: { onClose: () => void }) =>
  customRender(<Router onClose={onClose} />);

describe('<Router />', () => {
  it("should navigate from 'Your Playbook' to 'Who to onboard' screen by way of stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    const KYC = screen.getByText('Onboard people');
    await userEvent.click(KYC);
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();

    const whoToOnboard = screen.getByRole('button', {
      name: 'Who to onboard',
    });
    await userEvent.click(whoToOnboard);
    expect(
      screen.getByText('Who would you like to onboard?'),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Your Playbook' to 'Who to onboard' screen by way of back button", async () => {
    renderRouter({ onClose: jest.fn() });
    const KYC = screen.getByText('Onboard people');
    await userEvent.click(KYC);
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();

    const backButton = screen.getByRole('button', {
      name: 'Back',
    });
    await userEvent.click(backButton);
    expect(
      screen.getByText('Who would you like to onboard?'),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Your Playbook' to 'Authorized scopes'", async () => {
    renderRouter({ onClose: jest.fn() });
    const KYC = screen.getByText('Onboard people');
    await userEvent.click(KYC);
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();

    const next = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(next);
    // stepper value and header
    expect(screen.getAllByText('Authorized scopes').length).toEqual(2);
  });

  it("should navigate from 'Authorized scopes' back to 'Your Playbook' with back button", async () => {
    renderRouter({ onClose: jest.fn() });
    const KYC = screen.getByText('Onboard people');
    await userEvent.click(KYC);
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();

    const next = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(next);
    // stepper value and header
    expect(screen.getAllByText('Authorized scopes').length).toEqual(2);
    const back = screen.getByRole('button', { name: 'Back' });
    await userEvent.click(back);
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Authorized scopes' back to 'Your Playbook' via stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    const KYC = screen.getByText('Onboard people');
    await userEvent.click(KYC);
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();

    const next = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(next);
    // stepper value and header
    expect(screen.getAllByText('Authorized scopes').length).toEqual(2);
    const yourPlaybook = screen.getByRole('button', { name: 'Your Playbook' });
    await userEvent.click(yourPlaybook);
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Authorized scopes' back to 'Who to onboard' via stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    const KYC = screen.getByText('Onboard people');
    await userEvent.click(KYC);
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await userEvent.click(continueButton);
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();

    const next = screen.getByRole('button', { name: 'Next' });
    await userEvent.click(next);
    // stepper value and header
    expect(screen.getAllByText('Authorized scopes').length).toEqual(2);
    const whoToOnboard = screen.getByRole('button', { name: 'Who to onboard' });
    await userEvent.click(whoToOnboard);
    expect(
      screen.getByText('Who would you like to onboard?'),
    ).toBeInTheDocument();
  });
});
