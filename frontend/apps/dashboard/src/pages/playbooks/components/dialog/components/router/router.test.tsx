import {
  customRender,
  screen,
  userEvent,
  waitFor,
} from '@onefootprint/test-utils';
import React from 'react';

import Router from './router';
import {
  confirmPlaybookRecommendation,
  enterName,
  selectWhoToOnboard,
  withOnboardingConfigs,
} from './router.test.config';

const renderRouter = ({ onClose }: { onClose: () => void }) =>
  customRender(<Router onClose={onClose} />);

describe('<Router />', () => {
  it("should navigate from 'Name your Playbook' to 'Who to Onboard' screen by way of stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    await selectWhoToOnboard();
    expect(screen.getByText('Name your Playbook')).toBeInTheDocument();
    const whoToOnboard = screen.getByRole('button', {
      name: 'Who to onboard',
    });
    await userEvent.click(whoToOnboard);
    expect(
      screen.getByText('Who would you like to onboard?'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('This helps us better recommend which data to collect.'),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Name your playbook' to 'Who to Onboard' screen by way of back button", async () => {
    renderRouter({ onClose: jest.fn() });
    await selectWhoToOnboard();
    expect(screen.getByText('Name your Playbook')).toBeInTheDocument();
    const back = screen.getByRole('button', {
      name: 'Back',
    });
    await userEvent.click(back);
    await waitFor(() => {
      expect(
        screen.getByText('Who would you like to onboard?'),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText('This helps us better recommend which data to collect.'),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Your Playbook' to 'Who to onboard' screen by way of stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    await selectWhoToOnboard();
    await enterName();
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

  it("should navigate from 'Your Playbook' back to 'Name your Playbook' via stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    await selectWhoToOnboard();
    await enterName();
    const nameYourPlaybook = screen.getByRole('button', {
      name: 'Name your Playbook',
    });
    await userEvent.click(nameYourPlaybook);
    expect(
      screen.getByText(
        'This helps you easily identify your Playbook, especially if you have multiple ones.',
      ),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Your Playbook' to 'Who to onboard' screen by way of back button", async () => {
    renderRouter({ onClose: jest.fn() });
    await selectWhoToOnboard();
    await enterName();
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
    await selectWhoToOnboard();
    await enterName();

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
    await selectWhoToOnboard();
    await enterName();
    await confirmPlaybookRecommendation();
    const back = screen.getByRole('button', { name: 'Back' });
    await userEvent.click(back);
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Authorized scopes' back to 'Your Playbook' via stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    await selectWhoToOnboard();
    await enterName();
    await confirmPlaybookRecommendation();
    const yourPlaybook = screen.getByRole('button', { name: 'Your Playbook' });
    await userEvent.click(yourPlaybook);
    expect(
      screen.getByText('Your Playbook recommendation'),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Authorized scopes' back to 'Who to onboard' via stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    await selectWhoToOnboard();
    await enterName();
    await confirmPlaybookRecommendation();
    const whoToOnboard = screen.getByRole('button', { name: 'Who to onboard' });
    await userEvent.click(whoToOnboard);
    expect(
      screen.getByText('Who would you like to onboard?'),
    ).toBeInTheDocument();
  });

  it("should navigate from 'Authorized scopes' back to 'Name your Playbook' via stepper", async () => {
    renderRouter({ onClose: jest.fn() });
    await selectWhoToOnboard();
    await enterName();
    await confirmPlaybookRecommendation();
    const nameYourPlaybook = screen.getByRole('button', {
      name: 'Name your Playbook',
    });
    await userEvent.click(nameYourPlaybook);
    expect(
      screen.getByText(
        'This helps you easily identify your Playbook, especially if you have multiple ones.',
      ),
    ).toBeInTheDocument();
  });

  it('should show toast on success', async () => {
    const closeFn = jest.fn();
    withOnboardingConfigs();
    renderRouter({ onClose: closeFn });
    await selectWhoToOnboard();
    await enterName();
    await confirmPlaybookRecommendation();
    const createPlaybook = screen.getByRole('button', {
      name: 'Create Playbook',
    });
    await userEvent.click(createPlaybook);
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
    expect(
      screen.getByText('Playbook created successfully.'),
    ).toBeInTheDocument();
    expect(closeFn).toHaveBeenCalled();
  });
});
